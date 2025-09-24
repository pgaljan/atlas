import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as xlsx from 'xlsx';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/updateUser.dto';
import { ExportMetricsDto } from './dto/export-metrics.dto';
import {
  bigIntBytesToMiBNumber,
  getAttachmentBytesBigInt,
  getBackupBytesBigInt,
} from 'src/storage/storage-size.util';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}
  private readonly logger = new Logger(UserService.name);
  private bigintReplacer(_key: string, value: any): any {
    return typeof value === 'bigint' ? value.toString() : value;
  }
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

  async exportUserMetrics(dto: ExportMetricsDto): Promise<Buffer> {
    try {
      const { startDate, endDate } = dto;

      const isValidDate = (d: any) =>
        d instanceof Date && !Number.isNaN(d.getTime());
      const parseSafeDate = (v?: string | Date) => {
        if (!v) return null;
        const d = v instanceof Date ? v : new Date(v);
        return isValidDate(d) ? d : null;
      };
      const safeTrimAndLimit = (s?: string, max = 1000) => {
        if (typeof s !== 'string') return '';
        const t = s.trim();
        return t.length > max ? t.slice(0, max) + '...' : t;
      };

      const createdAtWhere: any = {};
      const start = parseSafeDate(startDate);
      const end = parseSafeDate(endDate);

      if (start) createdAtWhere.gte = start;
      if (end) createdAtWhere.lte = end;

      const applyDateFilter = !!(createdAtWhere.gte || createdAtWhere.lte);

      const users = await this.prisma.user.findMany({
        select: {
          id: true,
          displayName: true,
          role: { select: { name: true } },
          subscription: { select: { plan: { select: { name: true } } } },
          storedBytes: true,
        },
      });

      const attachmentsWhere = applyDateFilter
        ? { createdAt: createdAtWhere }
        : {};
      const backupsWhere = applyDateFilter ? { createdAt: createdAtWhere } : {};
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
        backups,
        storageEvents,
      ] = await Promise.all([
        this.prisma.attachment.findMany({
          where: attachmentsWhere,
          select: {
            id: true,
            userId: true,
            data: true,
            fileUrl: true,
            fileType: true,
            sizeBytes: true,
            createdAt: true,
            updatedAt: true,
          },
        }),

        this.prisma.record.findMany({
          where: recordsWhere,
          select: {
            id: true,
            editorType: true,
            renderer: true,
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

        this.prisma.structureShareInvitation.findMany({
          where: invitationsWhere,
          select: {
            id: true,
            inviteeId: true,
            inviteeUsername: true,
            permission: true,
            status: true,
            createdAt: true,
            usedAt: true,
            message: true,
            inviterId: true,
            structure: { select: { id: true, ownerId: true, createdAt: true } },
          },
        }),

        this.prisma.token.findMany({
          where: tokensWhere,
          select: { id: true, userId: true, key: true, createdAt: true },
        }),

        this.prisma.auditLog.findMany({
          where: auditLogsWhere,
          select: {
            action: true,
            createdAt: true,
            userId: true,
            elementId: true,
            element: true,
            details: true,
          },
        }),

        this.prisma.element.findMany({
          where: applyDateFilter ? { createdAt: createdAtWhere } : {},
          select: {
            id: true,
            tags: true,
            structure: { select: { id: true, ownerId: true, createdAt: true } },
            createdAt: true,
            updatedAt: true,
          },
        }),

        this.prisma.backup.findMany({
          where: backupsWhere,
          select: {
            id: true,
            userId: true,
            backupData: true,
            fileUrl: true,
            sizeBytes: true,
            createdAt: true,
            updatedAt: true,
          },
        }),

        this.prisma.storageEvent.findMany({
          where: applyDateFilter ? { createdAt: createdAtWhere } : {},
          select: {
            id: true,
            userId: true,
            bytes: true,
            sign: true,
            type: true,
            createdAt: true,
          },
        }),
      ]);

      const elementCreatorById: Record<string, string | null> = {};
      const elementCreatorTs: Record<string, number> = {};
      const lastTagEditorByElement: Record<string, string | null> = {};
      const lastTagEditorTs: Record<string, number> = {};

      for (const log of auditLogs || []) {
        if (!log || !log.elementId) continue;
        const eid = log.elementId;
        const elType = (log.element || '').toString();
        if (elType !== 'Element') continue;

        const ts = log.createdAt
          ? new Date(log.createdAt).getTime()
          : Date.now();
        const action = (log.action || '').toString();

        if (action === 'CREATE_ELEMENT' || action === 'CREATE_NESTED_ELEMENT') {
          if (
            !elementCreatorById[eid] ||
            ts < (elementCreatorTs[eid] || Infinity)
          ) {
            elementCreatorById[eid] = log.userId || null;
            elementCreatorTs[eid] = ts;
          }
        }

        if (action === 'UPDATE') {
          try {
            const det: any = log.details;
            const updatedData = det?.updatedData;
            if (
              updatedData &&
              Object.prototype.hasOwnProperty.call(updatedData, 'tags')
            ) {
              if (
                !lastTagEditorByElement[eid] ||
                ts > (lastTagEditorTs[eid] || 0)
              ) {
                lastTagEditorByElement[eid] = log.userId || null;
                lastTagEditorTs[eid] = ts;
              }
            }
          } catch {
            // ignore malformed details
          }
        }
      }

      const eventsByUser: Record<string, any[]> = {};
      for (const ev of storageEvents || []) {
        if (!ev || !ev.userId) continue;
        if (!eventsByUser[ev.userId]) eventsByUser[ev.userId] = [];
        eventsByUser[ev.userId].push(ev);
      }

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
          backups,
          storageEvents,
          new Date(startDate),
          new Date(endDate),
          elementCreatorById,
          elementCreatorTs,
          lastTagEditorByElement,
          lastTagEditorTs,
        );
      }

      const creditedUserByElement: Record<string, string | null> = {};
      for (const el of elements || []) {
        const elId = el.id;
        const tagEditor = lastTagEditorByElement[elId] ?? null;
        const creator = elementCreatorById[elId] ?? null;
        const ownerFallback = el.structure?.ownerId ?? null;

        creditedUserByElement[elId] = creator || ownerFallback;
      }

      const userMetrics = users.map((user) => {
        const userAttachments = attachments.filter((a) => a.userId === user.id);
        const userBackups = backups.filter((b) => b.userId === user.id);

        const events = eventsByUser[user.id] ?? [];
        let totalUploadsBytes = 0n;
        for (const ev of events) {
          const b = BigInt((ev.bytes as any) ?? 0);
          const s = typeof ev.sign === 'number' ? ev.sign : 1;
          if (s === 1) totalUploadsBytes += b;
        }
        const totalBytesFromFiles =
          userAttachments.reduce(
            (sum: bigint, a) => sum + getAttachmentBytesBigInt(a),
            0n,
          ) +
          userBackups.reduce(
            (sum: bigint, b) => sum + getBackupBytesBigInt(b),
            0n,
          );
        const effectiveUploads =
          totalUploadsBytes > 0n ? totalUploadsBytes : totalBytesFromFiles;
        const mibTransmitted = bigIntBytesToMiBNumber(effectiveUploads, 2);

        const storedBytesBigInt = user.storedBytes
          ? BigInt(user.storedBytes)
          : 0n;
        const mibStored = bigIntBytesToMiBNumber(storedBytesBigInt, 2);

        const userStructures = structures.filter((s) => s.ownerId === user.id);
        const structuresByType = userStructures.reduce(
          (acc, s) => {
            acc[s.type || 'default'] = (acc[s.type || 'default'] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        );

        const creditedElements = elements.filter((el) => {
          const elId = el.id;
          const credited =
            creditedUserByElement[elId] ?? el.structure?.ownerId ?? null;
          return credited === user.id;
        });
        const userElementsCount = creditedElements.length;

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

        const tagCount = elements.reduce((sum: number, el) => {
          if (!el || !el.id) return sum;
          const tagsVal = (el as any).tags;
          if (tagsVal == null) return sum;

          const tagEditor = lastTagEditorByElement[el.id] ?? null;
          const creator = elementCreatorById[el.id] ?? null;
          const ownerFallback = el.structure?.ownerId ?? null;
          const credited = tagEditor || creator || ownerFallback;

          if (credited !== user.id) return sum;

          // parse tagsVal robustly
          if (Array.isArray(tagsVal)) return sum + tagsVal.length;
          if (typeof tagsVal === 'object') {
            try {
              return sum + Object.keys(tagsVal).length;
            } catch {
              return sum;
            }
          }
          if (typeof tagsVal === 'string') {
            const s = tagsVal.trim();
            if (!s) return sum;
            try {
              const parsed = JSON.parse(s);
              if (Array.isArray(parsed)) return sum + parsed.length;
              if (typeof parsed === 'object')
                return sum + Object.keys(parsed).length;
            } catch {
              const parts = s
                .split(',')
                .map((p) => p.trim())
                .filter(Boolean);
              if (parts.length > 0) return sum + parts.length;
              return sum + 1;
            }
          }
          return sum;
        }, 0);

        const userShares = shares.filter(
          (s) => s.structure?.ownerId === user.id,
        );
        const userInvitations = shareInvitations.filter(
          (i) => i.structure?.ownerId === user.id,
        );

        const uniqueShareMap = new Map<string, string>();
        userShares.forEach((s) =>
          uniqueShareMap.set(
            `${s.structure?.id}-${s.permission}`,
            s.permission,
          ),
        );
        userInvitations.forEach((i) =>
          uniqueShareMap.set(
            `${i.structure?.id}-${i.permission}`,
            i.permission,
          ),
        );

        const sharedByType = Array.from(uniqueShareMap.values()).reduce(
          (acc: any, perm: string) => {
            acc.total = (acc.total || 0) + 1;
            acc[perm] = (acc[perm] || 0) + 1;
            return acc;
          },
          { total: 0, viewer: 0, commenter: 0, editor: 0, owner: 0 },
        );

        const selfLogins = auditLogs.filter(
          (l) => l.userId === user.id && l.action === 'User Login',
        ).length;

        const collaboratorIds = new Set<string>();
        userShares.forEach((s) => {
          if (s.userId && s.userId !== user.id) collaboratorIds.add(s.userId);
        });
        userInvitations.forEach((i) => {
          if (i.inviteeId && i.inviteeId !== user.id)
            collaboratorIds.add(i.inviteeId);
        });

        const collaboratorLoginEvents = new Set<string>();
        auditLogs.forEach((l) => {
          if (collaboratorIds.has(l.userId) && l.action === 'User Login') {
            collaboratorLoginEvents.add(`${l.userId}-${l.createdAt}`);
          }
        });
        const collaboratorLogins = collaboratorLoginEvents.size;

        const invitationsWithMessage = userInvitations.filter(
          (inv) =>
            typeof inv.message === 'string' && inv.message.trim().length > 0,
        );

        const isLikelyEmail = (s?: string) =>
          typeof s === 'string' && /\S+@\S+\.\S+/.test(s);

        const grouped: Record<
          string,
          {
            recipient: string;
            recipientType: 'email' | 'platform' | 'unknown';
            messages: Array<{
              id: string;
              text: string;
              createdAt?: string;
              inviterId?: string;
              structureId?: string;
            }>;
          }
        > = {};

        for (const inv of invitationsWithMessage) {
          const text = safeTrimAndLimit(inv.message);
          const createdAtIso = inv.createdAt
            ? new Date(inv.createdAt).toISOString()
            : undefined;

          if (inv.inviteeUsername && inv.inviteeUsername.trim()) {
            const uname = inv.inviteeUsername.trim();
            const recipientType = isLikelyEmail(uname) ? 'email' : 'platform';
            const key = `recipient:${recipientType}:${uname}`;
            if (!grouped[key]) {
              grouped[key] = { recipient: uname, recipientType, messages: [] };
            }
            grouped[key].messages.push({
              id: inv.id,
              text,
              createdAt: createdAtIso,
              inviterId: inv.inviterId,
              structureId: inv.structure?.id,
            });
          } else if (inv.inviteeId) {
            const key = `recipient:platform:${inv.inviteeId}`;
            if (!grouped[key])
              grouped[key] = {
                recipient: inv.inviteeId,
                recipientType: 'platform',
                messages: [],
              };
            grouped[key].messages.push({
              id: inv.id,
              text,
              createdAt: createdAtIso,
              inviterId: inv.inviterId,
              structureId: inv.structure?.id,
            });
          } else {
            const key = `recipient:unknown:${inv.id}`;
            if (!grouped[key])
              grouped[key] = {
                recipient: 'unknown',
                recipientType: 'unknown',
                messages: [],
              };
            grouped[key].messages.push({
              id: inv.id,
              text,
              createdAt: createdAtIso,
              inviterId: inv.inviterId,
              structureId: inv.structure?.id,
            });
          }
        }

        const messagesToUserEmail = Object.values(grouped);

        return {
          userId: user.id,
          userTier: user.subscription?.plan?.name || 'Free',
          displayName: user.displayName || 'Unknown',
          mibTransmitted: parseFloat(mibTransmitted.toFixed(2)),
          mibStored: parseFloat(mibStored.toFixed(2)),
          structuresByType,
          elements: userElementsCount,
          recordsByType,
          tagCount,
          sharedByType,
          loginsSelf: selfLogins,
          loginsCollaborators: collaboratorLogins,
          messagesToUserEmail,
        };
      });

      return Buffer.from(JSON.stringify(userMetrics, this.bigintReplacer, 2));
    } catch (error) {
      this.logger.error('Error in exportUserMetrics', error);
      throw new InternalServerErrorException(
        `Failed to export user metrics: ${error?.message || error?.toString()}`,
      );
    }
  }

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
    backups: any[],
    storageEvents: any[],
    startDate: Date,
    endDate: Date,
    elementCreatorById: Record<string, string | null>,
    elementCreatorTs: Record<string, number>,
    lastTagEditorByElement: Record<string, string | null>,
    lastTagEditorTs: Record<string, number>,
  ): Promise<Buffer> {
    const dateRange = this.generateDateRange(startDate, endDate);
    const allUserDailyMetrics: any[] = [];

    const safeTrimAndLimit = (s?: string, max = 1000) => {
      if (typeof s !== 'string') return '';
      const t = s.trim();
      return t.length > max ? t.slice(0, max) + '...' : t;
    };

    const attachmentsByUser = attachments.reduce(
      (acc: any, a: any) => {
        if (!acc[a.userId]) acc[a.userId] = [];
        acc[a.userId].push(a);
        return acc;
      },
      {} as Record<string, any[]>,
    );

    const backupsByUser = backups.reduce(
      (acc: any, b: any) => {
        if (!acc[b.userId]) acc[b.userId] = [];
        acc[b.userId].push(b);
        return acc;
      },
      {} as Record<string, any[]>,
    );

    const eventsByUser: Record<string, any[]> = {};
    for (const ev of storageEvents || []) {
      if (!ev || !ev.userId) continue;
      if (!eventsByUser[ev.userId]) eventsByUser[ev.userId] = [];
      eventsByUser[ev.userId].push(ev);
    }

    for (const uid of Object.keys(eventsByUser)) {
      eventsByUser[uid].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    }

    const elementsById: Record<string, any> = {};
    for (const el of elements || []) {
      elementsById[el.id] = el;
    }

    for (const user of users) {
      const userAtts = attachmentsByUser[user.id] ?? [];
      const userBackups = backupsByUser[user.id] ?? [];
      const userEvents = eventsByUser[user.id] ?? [];

      for (const date of dateRange) {
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);
        const inDay = (d: Date) => d >= dayStart && d <= dayEnd;

        let dayUploadsBytes = 0n;

        for (const ev of userEvents) {
          const created = ev.createdAt ? new Date(ev.createdAt) : null;
          if (!created || Number.isNaN(created.getTime())) continue;
          const sign = typeof ev.sign === 'number' ? ev.sign : 1;
          if (inDay(created) && sign === 1) {
            try {
              dayUploadsBytes += BigInt((ev.bytes as any) ?? 0);
            } catch (e) {
              // ignore parse errors
            }
          }
        }

        if (dayUploadsBytes === 0n) {
          const dayAttachments = userAtts.filter((a) => {
            const createdAt = a.createdAt ? new Date(a.createdAt) : null;
            if (!createdAt || Number.isNaN(createdAt.getTime())) {
              const dataCreated = a?.data?.createdAt
                ? new Date(a.data.createdAt)
                : null;
              if (!dataCreated || Number.isNaN(dataCreated.getTime()))
                return false;
              return inDay(dataCreated);
            }
            return inDay(createdAt);
          });

          const dayBackups = userBackups.filter((b) => {
            const createdAt = b.createdAt ? new Date(b.createdAt) : null;
            if (!createdAt || Number.isNaN(createdAt.getTime())) {
              const dataCreated = b?.backupData?.createdAt
                ? new Date(b.backupData.createdAt)
                : null;
              if (!dataCreated || Number.isNaN(dataCreated.getTime()))
                return false;
              return inDay(dataCreated);
            }
            return inDay(createdAt);
          });

          dayUploadsBytes =
            dayAttachments.reduce(
              (sum: bigint, a: any) => sum + getAttachmentBytesBigInt(a),
              0n,
            ) +
            dayBackups.reduce(
              (sum: bigint, b: any) => sum + getBackupBytesBigInt(b),
              0n,
            );
        }

        const mibTransmitted = bigIntBytesToMiBNumber(dayUploadsBytes, 2);

        let mibStored = 0;
        if (userEvents && userEvents.length > 0) {
          let baseline = 0n;
          for (const ev of userEvents) {
            const created = ev.createdAt ? new Date(ev.createdAt) : null;
            if (!created || Number.isNaN(created.getTime())) continue;
            if (created < dayStart) {
              const s = typeof ev.sign === 'number' ? ev.sign : 1;
              try {
                baseline += BigInt(s) * BigInt((ev.bytes as any) ?? 0);
              } catch {
                // ignore parse errors
              }
            }
          }
          if (baseline < 0n) baseline = 0n;

          let running = baseline;
          let maxDuringDay = running;
          for (const ev of userEvents) {
            const created = ev.createdAt ? new Date(ev.createdAt) : null;
            if (!created || Number.isNaN(created.getTime())) continue;
            if (created >= dayStart && created <= dayEnd) {
              const s = typeof ev.sign === 'number' ? ev.sign : 1;
              try {
                running += BigInt(s) * BigInt((ev.bytes as any) ?? 0);
                if (running > maxDuringDay) maxDuringDay = running;
              } catch {
                // ignore parse errors
              }
            }
          }
          if (running > maxDuringDay) maxDuringDay = running;
          if (maxDuringDay < 0n) maxDuringDay = 0n;
          mibStored = bigIntBytesToMiBNumber(maxDuringDay, 2);
        } else {
          let cumulativeBytesBigInt = 0n;
          for (const att of userAtts) {
            const createdAt = att.createdAt ? new Date(att.createdAt) : null;
            const created =
              createdAt && !Number.isNaN(createdAt.getTime())
                ? createdAt
                : att?.data?.createdAt
                  ? new Date(att.data.createdAt)
                  : null;
            if (!created || Number.isNaN(created.getTime())) continue;
            if (created <= dayEnd)
              cumulativeBytesBigInt += getAttachmentBytesBigInt(att);
          }
          for (const b of userBackups) {
            const createdAt = b.createdAt ? new Date(b.createdAt) : null;
            const created =
              createdAt && !Number.isNaN(createdAt.getTime())
                ? createdAt
                : b?.backupData?.createdAt
                  ? new Date(b.backupData.createdAt)
                  : null;
            if (!created || Number.isNaN(created.getTime())) continue;
            if (created <= dayEnd)
              cumulativeBytesBigInt += getBackupBytesBigInt(b);
            const deletedAt = b?.backupData?.deletedAt
              ? new Date(b.backupData.deletedAt)
              : null;
            if (
              deletedAt &&
              !Number.isNaN(deletedAt.getTime()) &&
              deletedAt <= dayEnd
            ) {
              cumulativeBytesBigInt -= getBackupBytesBigInt(b);
            }
          }
          if (cumulativeBytesBigInt < 0n) cumulativeBytesBigInt = 0n;
          mibStored = bigIntBytesToMiBNumber(cumulativeBytesBigInt, 2);
        }

        const dayStructures = structures.filter(
          (s) =>
            s.ownerId === user.id &&
            s.createdAt &&
            (() => {
              const c = new Date(s.createdAt);
              return !Number.isNaN(c.getTime()) && inDay(c);
            })(),
        );
        const structuresByType = dayStructures.reduce(
          (acc: any, s: any) => {
            acc[s.type || 'default'] = (acc[s.type || 'default'] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        );

        const dayElementsCreatedByUser = Object.values(elementsById).filter(
          (el: any) => {
            if (!el || !el.id) return false;
            const createdAt = el.createdAt ? new Date(el.createdAt) : null;
            const createTsFromAudit = elementCreatorTs[el.id];
            if (createTsFromAudit) {
              const t = new Date(createTsFromAudit);
              return elementCreatorById[el.id] === user.id && inDay(t);
            }
            return (
              (elementCreatorById[el.id] === user.id ||
                (elementCreatorById[el.id] == null &&
                  el.structure?.ownerId === user.id)) &&
              createdAt &&
              inDay(createdAt)
            );
          },
        );

        const dayElementsCount = dayElementsCreatedByUser.length;

        const dayRecords = records.filter((r) =>
          (r.Element || []).some((e: any) => {
            const struct = e.structure;
            if (!struct) return false;
            const created = r.createdAt
              ? new Date(r.createdAt)
              : struct.createdAt
                ? new Date(struct.createdAt)
                : null;
            return (
              created &&
              !Number.isNaN(created.getTime()) &&
              inDay(created) &&
              (elementCreatorById[e.id] === user.id ||
                struct.ownerId === user.id)
            );
          }),
        );
        const recordsByType = dayRecords.reduce(
          (acc: any, r: any) => {
            acc[r.editorType] = (acc[r.editorType] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        );

        const dayTagCount = Object.values(elementsById).reduce(
          (sum: number, el: any) => {
            if (!el || !el.id) return sum;
            const tagsVal = el.tags;
            if (tagsVal == null) return sum;

            const lastEditor = lastTagEditorByElement[el.id] ?? null;
            const lastEditorTs = lastTagEditorTs[el.id] ?? null;
            const creator = elementCreatorById[el.id] ?? null;
            const creatorTs = elementCreatorTs[el.id] ?? null;
            const ownerFallback = el.structure?.ownerId ?? null;

            let contributedThisDay = false;
            if (lastEditor && lastEditor === user.id && lastEditorTs) {
              const t = new Date(lastEditorTs);
              if (inDay(t)) contributedThisDay = true;
            }
            if (
              !contributedThisDay &&
              creator &&
              creator === user.id &&
              creatorTs
            ) {
              const t = new Date(creatorTs);
              if (inDay(t)) contributedThisDay = true;
            }
            if (!contributedThisDay) {
              const createdAt = el.createdAt ? new Date(el.createdAt) : null;
              const credited = creator || ownerFallback;
              if (credited === user.id && createdAt && inDay(createdAt))
                contributedThisDay = true;
            }
            if (!contributedThisDay) return sum;

            if (Array.isArray(tagsVal)) return sum + tagsVal.length;
            if (typeof tagsVal === 'object') {
              try {
                return sum + Object.keys(tagsVal).length;
              } catch {
                return sum;
              }
            }
            if (typeof tagsVal === 'string') {
              const s = tagsVal.trim();
              if (!s) return sum;
              try {
                const parsed = JSON.parse(s);
                if (Array.isArray(parsed)) return sum + parsed.length;
                if (typeof parsed === 'object')
                  return sum + Object.keys(parsed).length;
              } catch {
                const parts = s
                  .split(',')
                  .map((p) => p.trim())
                  .filter(Boolean);
                if (parts.length > 0) return sum + parts.length;
                return sum + 1;
              }
            }
            return sum;
          },
          0,
        );

        const dayShares = shares.filter(
          (s) =>
            s.structure &&
            s.structure.ownerId === user.id &&
            s.createdAt &&
            (() => {
              const c = new Date(s.createdAt);
              return !Number.isNaN(c.getTime()) && inDay(c);
            })(),
        );
        const dayInvitations = shareInvitations.filter(
          (i) =>
            i.structure &&
            i.structure.ownerId === user.id &&
            ((i.createdAt &&
              (() => {
                const c = new Date(i.createdAt);
                return !Number.isNaN(c.getTime()) && inDay(c);
              })()) ||
              (i.usedAt &&
                (() => {
                  const u = new Date(i.usedAt);
                  return !Number.isNaN(u.getTime()) && inDay(u);
                })())),
        );

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
            const perm = rec.permission || 'viewer';
            acc.total = (acc.total || 0) + 1;
            acc[perm] = (acc[perm] || 0) + 1;
            return acc;
          },
          { ...initShared },
        );

        const selfLogins = auditLogs.filter((l) => {
          const c = l.createdAt ? new Date(l.createdAt) : null;
          return (
            l.userId === user.id && l.action === 'User Login' && c && inDay(c)
          );
        }).length;

        const dayCollaboratorIds = new Set<string>();
        dayShares.forEach((s) => {
          if (s.userId) dayCollaboratorIds.add(s.userId);
        });
        dayInvitations.forEach((i) => {
          if (i.inviteeId) dayCollaboratorIds.add(i.inviteeId);
        });
        const dayCollaboratorLogins = auditLogs.filter((l) => {
          const c = l.createdAt ? new Date(l.createdAt) : null;
          return (
            c &&
            inDay(c) &&
            l.action === 'User Login' &&
            dayCollaboratorIds.has(l.userId)
          );
        }).length;

        const emailMessages = tokens.filter((t) => {
          const c = t.createdAt ? new Date(t.createdAt) : null;
          return (
            t.userId === user.id && t.key === 'reset-password' && c && inDay(c)
          );
        }).length;

        const dayInvWithMessage = dayInvitations.filter(
          (i) => typeof i.message === 'string' && i.message.trim().length > 0,
        );

        const isLikelyEmail = (s?: string) =>
          typeof s === 'string' && /\S+@\S+\.\S+/.test(s);

        const groupedDay: Record<
          string,
          {
            recipient: string;
            recipientType: 'email' | 'platform' | 'unknown';
            messages: Array<{
              id: string;
              text: string;
              createdAt?: string;
              inviterId?: string;
              structureId?: string;
            }>;
          }
        > = {};

        for (const inv of dayInvWithMessage) {
          const text = safeTrimAndLimit(inv.message);
          const createdAtIso = inv.createdAt
            ? new Date(inv.createdAt).toISOString()
            : undefined;

          if (inv.inviteeUsername && inv.inviteeUsername.trim()) {
            const uname = inv.inviteeUsername.trim();
            const recipientType = isLikelyEmail(uname) ? 'email' : 'platform';
            const key = `recipient:${recipientType}:${uname}`;
            if (!groupedDay[key])
              groupedDay[key] = {
                recipient: uname,
                recipientType,
                messages: [],
              };
            groupedDay[key].messages.push({
              id: inv.id,
              text,
              createdAt: createdAtIso,
              inviterId: inv.inviterId,
              structureId: inv.structure?.id,
            });
          } else if (inv.inviteeId) {
            const key = `recipient:platform:${inv.inviteeId}`;
            if (!groupedDay[key])
              groupedDay[key] = {
                recipient: inv.inviteeId,
                recipientType: 'platform',
                messages: [],
              };
            groupedDay[key].messages.push({
              id: inv.id,
              text,
              createdAt: createdAtIso,
              inviterId: inv.inviterId,
              structureId: inv.structure?.id,
            });
          } else {
            const key = `recipient:unknown:${inv.id}`;
            if (!groupedDay[key])
              groupedDay[key] = {
                recipient: 'unknown',
                recipientType: 'unknown',
                messages: [],
              };
            groupedDay[key].messages.push({
              id: inv.id,
              text,
              createdAt: createdAtIso,
              inviterId: inv.inviterId,
              structureId: inv.structure?.id,
            });
          }
        }

        const messagesToUserEmail = Object.values(groupedDay);

        allUserDailyMetrics.push({
          userId: user.id,
          userTier: user.subscription?.plan?.name || 'Free',
          displayName: user.displayName || 'Unknown',
          date: date.toISOString().split('T')[0],
          mibTransmitted: parseFloat(mibTransmitted.toFixed(2)),
          mibStored: parseFloat(mibStored.toFixed(2)),
          structuresByType,
          elements: dayElementsCount,
          recordsByType,
          tagCount: dayTagCount,
          sharedByType: daySharedByType,
          loginsSelf: selfLogins,
          loginsCollaborators: dayCollaboratorLogins,
          messagesToUserEmail,
        });
      }
    }

    return Buffer.from(
      JSON.stringify(allUserDailyMetrics, this.bigintReplacer, 2),
    );
  }

  private generateDateRange(start: Date, end: Date): Date[] {
    const dates: Date[] = [];
    const current = new Date(start);
    current.setHours(0, 0, 0, 0);

    const last = new Date(end);
    last.setHours(0, 0, 0, 0);

    while (current <= last) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }
}
