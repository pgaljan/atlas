import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLearnerProfileDto } from './create-learner-profile.dto';
import { UpdateLearnerProfileDto } from './update-learner-profile.dto';

@Injectable()
export class CleansheetService {
  constructor(private readonly prisma: PrismaService) {}
  private readonly logger = new Logger(CleansheetService.name);

  private async ensureUserExists(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  private requesterRoles(requester: any) {
    const roles = requester?.roles ?? [];
    return (Array.isArray(roles) ? roles : []).map((r: any) =>
      typeof r === 'string' ? r : (r?.name ?? ''),
    );
  }

  private hasRole(requester: any, allowed: string[]) {
    const roles = this.requesterRoles(requester);
    return roles.some((r: string) => allowed.includes(r));
  }

  private hasElevatedRole(requester: any) {
    return this.hasRole(requester, [
      'admin',
      'success_manager',
      'coach',
      'recruiter',
    ]);
  }

  private hasViewPermission(requester: any) {
    return this.hasRole(requester, [
      'admin',
      'success_manager',
      'coach',
      'recruiter',
    ]);
  }

  private hasDeletePermission(requester: any) {
    return this.hasRole(requester, ['admin', 'success_manager']);
  }

  async upsertProfile(
    requester: any,
    dto: CreateLearnerProfileDto,
    targetUserId?: string,
  ) {
    const ownerId = targetUserId ?? requester.id;
    if (!ownerId) throw new BadRequestException('Missing target user id');

    // if (ownerId !== requester.id && !this.hasElevatedRole(requester)) {
    //   throw new ForbiddenException(
    //     'Insufficient permissions to create/update profile for another user',
    //   );
    // }

    await this.ensureUserExists(ownerId);

    const exportDate = dto.exportDate ? new Date(dto.exportDate) : new Date();
    if (dto.exportDate && Number.isNaN(exportDate.getTime())) {
      throw new BadRequestException('exportDate is not a valid date');
    }

    const payload: any = {
      userId: ownerId,
      userName: dto.userName ?? '',
      userGoals: dto.userGoals ?? '',
      experiences: dto.experiences ?? [],
      exportDate,
      version: dto.version ?? '',
    };

    try {
      return this.prisma.learnerProfile.upsert({
        where: { userId: ownerId },
        create: payload,
        update: payload,
      });
    } catch (err) {
      this.logger.error('upsertProfile failed', err as any);
      throw new InternalServerErrorException('Failed to upsert profile');
    }
  }

  async getProfile(requester: any, targetUserId: string) {
    if (!targetUserId) throw new BadRequestException('Missing userId');

    // if (requester.id !== targetUserId && !this.hasViewPermission(requester)) {
    //   throw new ForbiddenException(
    //     'Insufficient permissions to view this profile',
    //   );
    // }

    try {
      const profile = await this.prisma.learnerProfile.findUnique({
        where: { userId: targetUserId },
      });

      if (!profile) {
        this.logger.warn(
          `No profile found for userId=${targetUserId}, returning empty fallback.`,
        );
        return {
          userId: targetUserId,
          userName: '',
          userGoals: '',
          experiences: [],
          exportDate: new Date().toISOString(),
          version: '1.0',
        };
      }

      return profile;
    } catch (err) {
      this.logger.error('getProfile failed', err as any);
      return {
        userId: targetUserId,
        userName: '',
        userGoals: '',
        experiences: [],
        exportDate: new Date().toISOString(),
        version: '1.0',
      };
    }
  }

  async updateProfile(
    requester: any,
    targetUserId: string,
    dto: UpdateLearnerProfileDto,
  ) {
    if (!targetUserId) throw new BadRequestException('Missing userId');

    // if (requester.id !== targetUserId && !this.hasElevatedRole(requester)) {
    //   throw new ForbiddenException(
    //     'Insufficient permissions to update this profile',
    //   );
    // }

    const existing = await this.prisma.learnerProfile.findUnique({
      where: { userId: targetUserId },
    });
    if (!existing) throw new NotFoundException('Profile not found');

    const data: any = {};
    if (dto.userName !== undefined) data.userName = dto.userName;
    if (dto.userGoals !== undefined) data.userGoals = dto.userGoals;
    if (dto.experiences !== undefined) data.experiences = dto.experiences;
    if (dto.exportDate !== undefined) {
      const d = new Date(dto.exportDate as string);
      if (Number.isNaN(d.getTime()))
        throw new BadRequestException('exportDate is not a valid date');
      data.exportDate = d;
    }
    if (dto.version !== undefined) data.version = dto.version;

    try {
      return this.prisma.learnerProfile.update({
        where: { userId: targetUserId },
        data,
      });
    } catch (err) {
      this.logger.error('updateProfile failed', err as any);
      throw new InternalServerErrorException('Failed to update profile');
    }
  }

  async deleteProfile(requester: any, targetUserId: string) {
    if (!targetUserId) throw new BadRequestException('Missing userId');

    // if (!this.hasDeletePermission(requester)) {
    //   throw new ForbiddenException(
    //     'Insufficient permissions to delete profiles',
    //   );
    // }

    const existing = await this.prisma.learnerProfile.findUnique({
      where: { userId: targetUserId },
    });
    if (!existing) throw new NotFoundException('Profile not found');

    try {
      return this.prisma.learnerProfile.delete({
        where: { userId: targetUserId },
      });
    } catch (err) {
      this.logger.error('deleteProfile failed', err as any);
      throw new InternalServerErrorException('Failed to delete profile');
    }
  }

  async importProfileFromJson(
    requester: any,
    json: any,
    targetUserId?: string,
  ) {
    try {
      const ownerId = targetUserId ?? requester.id;
      if (!ownerId) throw new BadRequestException('Missing target user');

      // if (ownerId !== requester.id && !this.hasElevatedRole(requester)) {
      //   throw new ForbiddenException(
      //     'Insufficient permissions to import profile for another user',
      //   );
      // }

      const requiredFields = [
        'userName',
        'userGoals',
        'experiences',
        'exportDate',
        'version',
      ];
      const missing = requiredFields.filter((f) => !(f in (json || {})));
      if (missing.length > 0) {
        throw new BadRequestException(
          `Missing required fields in profile JSON: ${missing.join(', ')}`,
        );
      }

      if (!Array.isArray(json.experiences)) {
        throw new BadRequestException('experiences must be an array');
      }

      const exportDate = new Date(json.exportDate);
      if (Number.isNaN(exportDate.getTime())) {
        throw new BadRequestException('exportDate is not a valid date');
      }

      await this.ensureUserExists(ownerId);

      const payload: any = {
        userId: ownerId,
        userName: String(json.userName ?? ''),
        userGoals: String(json.userGoals ?? ''),
        experiences: json.experiences,
        exportDate,
        version: String(json.version ?? ''),
        resumeJson: json,
        resumeAt: new Date(),
      };

      // upsert
      return this.prisma.learnerProfile.upsert({
        where: { userId: ownerId },
        create: payload,
        update: payload,
      });
    } catch (err) {
      this.logger.error('Error importing profile JSON:', err as any);
      if (
        err instanceof NotFoundException ||
        err instanceof ForbiddenException ||
        err instanceof BadRequestException
      ) {
        throw err;
      }
      throw new InternalServerErrorException('Failed to import profile JSON.');
    }
  }

  async exportProfileAsJson(requester: any, targetUserId: string) {
    try {
      if (!targetUserId) throw new BadRequestException('Missing userId');
      // if (requester.id !== targetUserId && !this.hasViewPermission(requester)) {
      //   throw new ForbiddenException('Insufficient permissions to export');
      // }

      const profile = await this.prisma.learnerProfile.findUnique({
        where: { userId: targetUserId },
      });
      if (!profile) throw new NotFoundException('Profile not found');

      if (profile.resumeJson) return profile.resumeJson;

      // Build JSON back from stored fields
      const built = {
        userName: profile.userName,
        userGoals: profile.userGoals,
        experiences: profile.experiences,
        exportDate:
          profile.exportDate instanceof Date
            ? profile.exportDate.toISOString()
            : profile.exportDate,
        version: profile.version,
      };

      return built;
    } catch (err) {
      this.logger.error('Error exporting profile JSON:', err as any);
      if (
        err instanceof NotFoundException ||
        err instanceof ForbiddenException
      ) {
        throw err;
      }
      throw new InternalServerErrorException('Failed to export profile JSON.');
    }
  }
}
