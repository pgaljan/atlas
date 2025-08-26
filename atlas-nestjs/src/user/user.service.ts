import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as xlsx from 'xlsx';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/updateUser.dto';
import { ExportMetricsDto } from './dto/export-metrics.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllUsers() {
    try {
      const users = await this.prisma.user.findMany({
        select: {
          id: true,
          displayName: true,
          username: true,
          email: true,
          inviteCount: true,
          profileUrl: true,
          isAdmin: true,
          createdAt: true,
          deletedAt: true,
          status: true,
          role: {
            select: {
              id: true,
              name: true,
            },
          },
          subscription: {
            select: {
              plan: {
                select: {
                  name: true,
                },
              },
            },
          },
          _count: {
            select: {
              invitationsSent: {
                where: {
                  status: 'accepted',
                },
              },
            },
          },
          auditLogs: {
            where: { action: 'User Login' },
            orderBy: { createdAt: 'desc' },
            select: {
              createdAt: true,
            },
          },
        },
      });

      return users.map((user) => ({
        ...user,
        acceptedInvitesCount: user._count?.invitationsSent || 0,
        onboardTime: user.createdAt,
        totalLogins: user.auditLogs.length,
        lastLogin: user.auditLogs[0]?.createdAt || null,
      }));
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to fetch users: ${error.message}`,
      );
    }
  }

  async getUserById(id: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      return user;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to fetch user with ID ${id}: ${error.message}`,
      );
    }
  }

  // Update user details and log action
  async updateUser(id: string, updateUserDto: UpdateUserDto, userId: string) {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      // Destructure role and other new fields from DTO.
      const { role, isAdmin, inviteCount, ...rest } = updateUserDto;

      const updateData: any = {
        ...rest,
        ...(role && { role: { connect: { id: role } } }),
      };

      // Update new fields if provided
      if (isAdmin !== undefined) {
        updateData.isAdmin = isAdmin;
      }

      if (inviteCount !== undefined) {
        updateData.inviteCount = inviteCount;
      }

      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: updateData,
      });

      // Log the update action in the AuditLog
      await this.prisma.auditLog.create({
        data: {
          action: 'User update',
          element: 'User',
          details: JSON.stringify(updateUserDto),
          userId: userId,
        },
      });

      return updatedUser;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to update user with ID ${id}: ${error.message}`,
      );
    }
  }

  async deleteUser(id: string, reason: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        include: {
          subscription: true,
          structures: true,
          teamMembers: true,
          tokens: true,
          backups: true,
          deletionLogs: true,
        },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      // Log the deletion action
      await this.prisma.auditLog.create({
        data: {
          action: 'User hard delete',
          element: 'User',
          details: JSON.stringify({ reason }),
          userId: id,
        },
      });

      // Delete all related records before deleting the user
      await this.prisma.$transaction([
        this.prisma.team.deleteMany({ where: { ownerId: id } }),

        // 2) your other dependent deletes
        this.prisma.subscription.deleteMany({ where: { userId: id } }),
        this.prisma.structure.deleteMany({ where: { ownerId: id } }),
        this.prisma.teamMember.deleteMany({ where: { userId: id } }),
        this.prisma.token.deleteMany({ where: { userId: id } }),
        this.prisma.backup.deleteMany({ where: { userId: id } }),
        this.prisma.attachment.deleteMany({ where: { userId: id } }),
        this.prisma.deletionLog.deleteMany({ where: { userId: id } }),

        // 3) finally delete the user
        this.prisma.user.delete({ where: { id } }),
      ]);

      return { message: `User ${id} and related data successfully deleted.` };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to delete user with ID ${id}: ${error.message}`,
      );
    }
  }

  // Change user password and log the action
  async changePassword(
    id: string,
    oldPassword: string,
    newPassword: string,
    userId: string,
  ) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      // Compare the old password with the current password in the database
      const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

      if (!isPasswordValid) {
        throw new ForbiddenException('Old password is incorrect');
      }

      // Hash the new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Update the password
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: { password: hashedNewPassword },
      });

      // Log the password change action in the AuditLog
      await this.prisma.auditLog.create({
        data: {
          action: 'Password change',
          element: 'User',
          details: JSON.stringify({ changedFields: ['password'] }),
          userId: userId,
        },
      });

      return updatedUser;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to change password for user with ID ${id}: ${error.message}`,
      );
    }
  }

  async exportUsersAsExcel(): Promise<Buffer> {
    try {
      // Get users data
      const users = await this.getAllUsers();

      // Prepare data for export
      const data = users.map((user) => ({
        Id: user.id,
        'Display Name': user.displayName,
        Username: user.username,
        Email: user.email,
        Status: user.status,
        Role: user.role ? user?.role?.name : '',
      }));

      // Create a new workbook and worksheet
      const workbook = xlsx.utils.book_new();
      const worksheet = xlsx.utils.json_to_sheet(data);
      xlsx.utils.book_append_sheet(workbook, worksheet, 'Users');

      // Write workbook to buffer
      const buffer: Buffer = xlsx.write(workbook, {
        type: 'buffer',
        bookType: 'xlsx',
      });
      return buffer;
    } catch (error) {
      console.log(error);
      console.error(
        'Error in exportUsersAsExcel:',
        error,
        error?.message,
        error?.stack,
      );
      throw new InternalServerErrorException(
        `Failed to export users: ${error?.message || error?.toString()}`,
      );
    }
  }

  private parseAttachmentSizeBytes(att: any): number {
    // Try several common places where size might be stored (bytes).
    const data = att?.data ?? {};
    const candidates = [
      data.size, // bytes OR MiB (we assume bytes)
      data?.meta?.size,
      data?.sizeInBytes,
      att.size, // fallback top-level
    ];
    for (const c of candidates) {
      if (typeof c === 'number' && !isNaN(c)) return c;
      if (typeof c === 'string' && c.trim() !== '') {
        const n = Number(c);
        if (!isNaN(n)) return n;
      }
    }
    return 0;
  }

  // --- replace your existing exportUserMetrics(...) with this ---
  // --- replace your existing exportUserMetrics(...) with this ---
  async exportUserMetrics(dto: ExportMetricsDto): Promise<Buffer> {
    try {
      const { startDate, endDate } = dto;

      // Build a createdAt where clause if date filters supplied
      const createdAtWhere: any = {};
      if (startDate) createdAtWhere.gte = new Date(startDate);
      if (endDate) createdAtWhere.lte = new Date(endDate);

      const applyDateFilter = !!(createdAtWhere.gte || createdAtWhere.lte);

      // Fetch users (all users, minimal info)
      const users = await this.prisma.user.findMany({
        select: {
          id: true,
          displayName: true,
          role: { select: { name: true } },
          subscription: { select: { plan: { select: { name: true } } } },
        },
      });

      // Preload related data (use createdAtWhere when applyDateFilter)
      const attachmentsWhere = applyDateFilter
        ? { createdAt: createdAtWhere }
        : {};
      const recordsWhere = applyDateFilter ? { createdAt: createdAtWhere } : {};
      const structuresWhere = applyDateFilter
        ? { createdAt: createdAtWhere }
        : {};
      const sharesWhere = applyDateFilter ? { createdAt: createdAtWhere } : {};
      const invitationsWhere = applyDateFilter
        ? { createdAt: createdAtWhere }
        : {};
      const tokensWhere = applyDateFilter ? { createdAt: createdAtWhere } : {};
      const auditLogsWhere = applyDateFilter
        ? { createdAt: createdAtWhere }
        : {};

      const [
        attachments,
        records,
        structures,
        shares,
        shareInvitations,
        tokens,
        auditLogs,
        elements,
      ] = await Promise.all([
        this.prisma.attachment.findMany({
          where: attachmentsWhere,
          select: { id: true, userId: true, data: true, createdAt: true },
        }),
        this.prisma.record.findMany({
          where: recordsWhere,
          select: {
            id: true,
            editorType: true,
            tags: true,
            createdAt: true,
            Element: {
              select: {
                id: true,
                structure: {
                  select: { id: true, ownerId: true, createdAt: true },
                },
              },
            },
          },
        }),
        this.prisma.structure.findMany({
          where: structuresWhere,
          select: { id: true, type: true, ownerId: true, createdAt: true },
        }),
        // StructureShare (explicit shares)
        this.prisma.structureShare.findMany({
          where: sharesWhere,
          select: {
            id: true,
            userId: true,
            permission: true,
            createdAt: true,
            structure: { select: { id: true, ownerId: true, createdAt: true } },
          },
        }),
        // StructureShareInvitation (invitations)
        this.prisma.structureShareInvitation.findMany({
          where: invitationsWhere,
          select: {
            id: true,
            inviteeId: true,
            permission: true,
            status: true,
            createdAt: true,
            usedAt: true,
            structure: { select: { id: true, ownerId: true, createdAt: true } },
          },
        }),
        this.prisma.token.findMany({
          where: tokensWhere,
          select: { id: true, userId: true, key: true, createdAt: true },
        }),
        this.prisma.auditLog.findMany({
          where: auditLogsWhere,
          select: { action: true, createdAt: true, userId: true },
        }),
        // preload elements (so we can compute elements per-user and per-day)
        this.prisma.element.findMany({
          where: applyDateFilter ? { createdAt: createdAtWhere } : {},
          select: {
            id: true,
            structure: { select: { id: true, ownerId: true, createdAt: true } },
            createdAt: true,
          },
        }),
      ]);

      // If startDate+endDate provided -> daily metrics
      if (startDate && endDate) {
        return this.generateDailyMetrics(
          users,
          attachments,
          records,
          structures,
          shares,
          shareInvitations,
          tokens,
          auditLogs,
          elements,
          new Date(startDate),
          new Date(endDate),
        );
      }

      // Aggregated export (no per-day split)
      const userMetrics = users.map((user) => {
        // attachments transmitted/stored
        const userAttachments = attachments.filter((a) => a.userId === user.id);
        const totalBytes = userAttachments.reduce((sum, a) => {
          const sizeBytes = this.parseAttachmentSizeBytes(a);
          return sum + sizeBytes;
        }, 0);
        const mibTransmitted = totalBytes / (1024 * 1024);
        const mibStored = mibTransmitted; // best-effort for aggregated export

        // structures and elements
        const userStructures = structures.filter((s) => s.ownerId === user.id);
        const structuresByType = userStructures.reduce(
          (acc, s) => {
            acc[s.type || 'default'] = (acc[s.type || 'default'] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        );
        const userElements = elements.filter(
          (el) => el.structure?.ownerId === user.id,
        );

        // records (by editor type) and tags
        const userRecords = records.filter((r) =>
          r.Element?.some((e) => e.structure?.ownerId === user.id),
        );
        const recordsByType = userRecords.reduce(
          (acc, r) => {
            acc[r.editorType] = (acc[r.editorType] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        );
        const tagCount = userRecords.filter((r) => r.tags !== null).length;

        // SHARES & INVITATIONS (only these two models)
        const userShares = shares.filter(
          (s) => s.structure?.ownerId === user.id,
        );
        const userInvitations = shareInvitations.filter(
          (i) => i.structure?.ownerId === user.id,
        );

        // Build canonical sharedByType with guaranteed keys
        const initShared = {
          total: 0,
          viewer: 0,
          commenter: 0,
          editor: 0,
          owner: 0,
        };
        const allShareRecords = [
          ...userShares.map((s) => ({ permission: s.permission })),
          ...userInvitations.map((i) => ({ permission: i.permission })),
        ];
        const sharedByType = allShareRecords.reduce(
          (acc: any, rec: any) => {
            const perm = (rec.permission as string) || 'viewer';
            acc.total = (acc.total || 0) + 1;
            acc[perm] = (acc[perm] || 0) + 1;
            return acc;
          },
          { ...initShared },
        );

        // Logins: self and collaborators
        const selfLogins = auditLogs.filter(
          (l) => l.userId === user.id && l.action === 'User Login',
        ).length;

        // collaborator ids come from explicit shares and from inviteeId (if present)
        const collaboratorIds = new Set<string>();
        userShares.forEach((s) => {
          if (s.userId) collaboratorIds.add(s.userId);
        });
        userInvitations.forEach((i) => {
          if (i.inviteeId) collaboratorIds.add(i.inviteeId);
        });

        const collaboratorLogins = auditLogs.filter(
          (l) => collaboratorIds.has(l.userId) && l.action === 'User Login',
        ).length;

        // messages to user (email tokens)
        const emailMessages = tokens.filter(
          (t) => t.userId === user.id && t.key === 'reset-password',
        ).length;

        return {
          userId: user.id,
          userTier: user.subscription?.plan?.name || 'Free',
          displayName: user.displayName || 'Unknown',
          mibTransmitted: parseFloat(mibTransmitted.toFixed(2)),
          mibStored: parseFloat(mibStored.toFixed(2)),
          structuresByType,
          elements: userElements.length,
          recordsByType,
          tagCount,
          sharedByType,
          loginsSelf: selfLogins,
          loginsCollaborators: collaboratorLogins,
          messagesToUserEmail: emailMessages,
        };
      });

      return Buffer.from(JSON.stringify(userMetrics, null, 2));
    } catch (error) {
      console.error('Error in exportUserMetrics:', error);
      throw new InternalServerErrorException(
        `Failed to export user metrics: ${error?.message || error?.toString()}`,
      );
    }
  }

  // --- replace your existing generateDailyMetrics(...) with this ---
  private async generateDailyMetrics(
    users: any[],
    attachments: any[],
    records: any[],
    structures: any[],
    shares: any[],
    shareInvitations: any[],
    tokens: any[],
    auditLogs: any[],
    elements: any[],
    startDate: Date,
    endDate: Date,
  ): Promise<Buffer> {
    const dateRange = this.generateDateRange(startDate, endDate);
    const allUserDailyMetrics: any[] = [];

    // group attachments by user for mibStored cumulative calc
    const attachmentsByUser = attachments.reduce(
      (acc: any, a: any) => {
        if (!acc[a.userId]) acc[a.userId] = [];
        acc[a.userId].push(a);
        return acc;
      },
      {} as Record<string, any[]>,
    );

    for (const user of users) {
      for (const date of dateRange) {
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);
        const inDay = (d: Date) => d >= dayStart && d <= dayEnd;

        // Attachments: those created that day
        const userAtts = attachmentsByUser[user.id] ?? [];
        const dayAttachments = userAtts.filter((a) => {
          const createdAt = a.createdAt ? new Date(a.createdAt) : null;
          if (!createdAt || isNaN(createdAt.getTime())) {
            const dataCreated = a?.data?.createdAt
              ? new Date(a.data.createdAt)
              : null;
            if (!dataCreated || isNaN(dataCreated.getTime())) return false;
            return inDay(dataCreated);
          }
          return inDay(createdAt);
        });
        const mibTransmittedBytes = dayAttachments.reduce(
          (sum, a) => sum + this.parseAttachmentSizeBytes(a),
          0,
        );
        const mibTransmitted = mibTransmittedBytes / (1024 * 1024);

        // mibStored: cumulative attachments up to dayEnd
        const cumulativeBytes = userAtts.reduce((sum, a) => {
          const createdAt = a.createdAt ? new Date(a.createdAt) : null;
          const created =
            createdAt && !isNaN(createdAt.getTime())
              ? createdAt
              : a?.data?.createdAt
                ? new Date(a.data.createdAt)
                : null;
          if (!created || isNaN(created.getTime())) return sum;
          if (created <= dayEnd) return sum + this.parseAttachmentSizeBytes(a);
          return sum;
        }, 0);
        const mibStored = cumulativeBytes / (1024 * 1024);

        // Structures created that day
        const dayStructures = structures.filter((s) => {
          if (s.ownerId !== user.id) return false;
          const created = s.createdAt ? new Date(s.createdAt) : null;
          return created && !isNaN(created.getTime()) && inDay(created);
        });
        const structuresByType = dayStructures.reduce(
          (acc, s) => {
            acc[s.type || 'default'] = (acc[s.type || 'default'] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        );

        // Elements created that day belonging to user's structures
        const dayElements = elements.filter((el) => {
          const elCreated = el.createdAt ? new Date(el.createdAt) : null;
          return (
            el.structure?.ownerId === user.id &&
            elCreated &&
            !isNaN(elCreated.getTime()) &&
            inDay(elCreated)
          );
        });

        // Records associated with user's structures and created that day
        const dayRecords = records.filter((r) =>
          (r.Element || []).some((e: any) => {
            const struct = e.structure;
            if (!struct || struct.ownerId !== user.id) return false;
            const created = r.createdAt
              ? new Date(r.createdAt)
              : struct.createdAt
                ? new Date(struct.createdAt)
                : null;
            if (!created || isNaN(created.getTime())) return false;
            return inDay(created);
          }),
        );
        const recordsByType = dayRecords.reduce(
          (acc, r) => {
            acc[r.editorType] = (acc[r.editorType] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        );
        const tagCount = dayRecords.filter((r) => r.tags !== null).length;

        // Shares for the day (explicit shares)
        const dayShares = shares.filter((s) => {
          if (!s.structure || s.structure.ownerId !== user.id) return false;
          const created = s.createdAt ? new Date(s.createdAt) : null;
          if (!created || isNaN(created.getTime())) return false;
          return inDay(created);
        });

        // Invitations for the day:
        // count invitation if createdAt OR usedAt falls in day (so accept events are captured)
        const dayInvitations = shareInvitations.filter((i) => {
          if (!i.structure || i.structure.ownerId !== user.id) return false;
          const created = i.createdAt ? new Date(i.createdAt) : null;
          const used = i.usedAt ? new Date(i.usedAt) : null;
          const createdIn =
            created && !isNaN(created.getTime()) && inDay(created);
          const usedIn = used && !isNaN(used.getTime()) && inDay(used);
          return createdIn || usedIn;
        });

        // Combine shares + invitations into sharedByType (guaranteed keys)
        const initShared = {
          total: 0,
          viewer: 0,
          commenter: 0,
          editor: 0,
          owner: 0,
        };
        const dayAllShareRecords = [
          ...dayShares.map((s) => ({
            permission: s.permission,
            userId: s.userId,
          })),
          ...dayInvitations.map((i) => ({
            permission: i.permission,
            inviteeId: i.inviteeId,
          })),
        ];
        const daySharedByType = dayAllShareRecords.reduce(
          (acc: any, rec: any) => {
            const perm = (rec.permission as string) || 'viewer';
            acc.total = (acc.total || 0) + 1;
            acc[perm] = (acc[perm] || 0) + 1;
            return acc;
          },
          { ...initShared },
        );

        // Logins: self and collaborators (for the day)
        const selfLogins = auditLogs.filter((l) => {
          const created = l.createdAt ? new Date(l.createdAt) : null;
          return (
            l.userId === user.id &&
            l.action === 'User Login' &&
            created &&
            inDay(created)
          );
        }).length;

        // collaborator ids for the day (from shares and invitees)
        const dayCollaboratorIds = new Set<string>();
        dayShares.forEach((s) => {
          if (s.userId) dayCollaboratorIds.add(s.userId);
        });
        dayInvitations.forEach((i) => {
          if (i.inviteeId) dayCollaboratorIds.add(i.inviteeId);
        });

        const dayCollaboratorLogins = auditLogs.filter((l) => {
          const created = l.createdAt ? new Date(l.createdAt) : null;
          return (
            created &&
            inDay(created) &&
            l.action === 'User Login' &&
            dayCollaboratorIds.has(l.userId)
          );
        }).length;

        // Emails (tokens) for that day
        const emailMessages = tokens.filter((t) => {
          const created = t.createdAt ? new Date(t.createdAt) : null;
          return (
            t.userId === user.id &&
            t.key === 'reset-password' &&
            created &&
            inDay(created)
          );
        }).length;

        allUserDailyMetrics.push({
          userId: user.id,
          userTier: user.subscription?.plan?.name || 'Free',
          displayName: user.displayName || 'Unknown',
          date: date.toISOString().split('T')[0],
          mibTransmitted: parseFloat(mibTransmitted.toFixed(2)),
          mibStored: parseFloat(mibStored.toFixed(2)),
          structuresByType,
          elements: dayElements.length,
          recordsByType,
          tagCount,
          sharedByType: daySharedByType,
          loginsSelf: selfLogins,
          loginsCollaborators: dayCollaboratorLogins,
          messagesToUserEmail: emailMessages,
        });
      } // date loop
    } // users loop

    return Buffer.from(JSON.stringify(allUserDailyMetrics, null, 2));
  }

  private generateDateRange(start: Date, end: Date): Date[] {
    const dates: Date[] = [];
    const current = new Date(start);
    current.setHours(0, 0, 0, 0);

    const last = new Date(end);
    last.setHours(0, 0, 0, 0);

    while (current <= last) {
      dates.push(new Date(current)); // push a clone
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }
}
