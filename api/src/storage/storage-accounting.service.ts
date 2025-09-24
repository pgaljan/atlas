import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StorageAccountingService {
  private readonly logger = new Logger(StorageAccountingService.name);

  constructor(private readonly prisma: PrismaService) {}

  async setStoredBytes(userId: string, absoluteBytes: bigint) {
    if (!userId || typeof absoluteBytes !== 'bigint') return;
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { storedBytes: absoluteBytes },
      });
    } catch (err) {
      this.logger.error(`setStoredBytes failed for ${userId}`, err as any);
      throw new InternalServerErrorException(
        `Failed to set stored bytes for ${userId}: ${err?.message ?? err}`,
      );
    }
  }
  async adjustStoredBytes(userId: string, deltaBytes: bigint) {
    if (!userId || typeof deltaBytes !== 'bigint') return;
    try {
      await this.prisma.$transaction(async (tx) => {
        const u = await tx.user.findUnique({
          where: { id: userId },
          select: { storedBytes: true },
        });

        const current: bigint = (u?.storedBytes as any) ?? 0n;
        let updated = current + deltaBytes;
        if (updated < 0n) updated = 0n;

        await tx.user.update({
          where: { id: userId },
          data: { storedBytes: updated },
        });
      });
    } catch (err) {
      this.logger.error(`adjustStoredBytes failed for ${userId}`, err as any);
      throw new InternalServerErrorException(
        `Failed to adjust stored bytes for ${userId}: ${err?.message ?? err}`,
      );
    }
  }

  async recordStorageEvent(
    userId: string,
    bytes: bigint,
    sign: number,
    type: string,
    createdAt?: Date,
  ) {
    if (!userId || typeof bytes !== 'bigint' || (sign !== 1 && sign !== -1))
      return;

    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.storageEvent.create({
          data: {
            userId,
            type,
            bytes,
            sign,
            ...(createdAt ? { createdAt } : {}),
          },
        });

        const u = await tx.user.findUnique({
          where: { id: userId },
          select: { storedBytes: true },
        });

        const current: bigint = (u?.storedBytes as any) ?? 0n;
        // Apply sign
        let updated = current + (sign === 1 ? bytes : -bytes);
        if (updated < 0n) updated = 0n;

        await tx.user.update({
          where: { id: userId },
          data: { storedBytes: updated },
        });
      });
    } catch (err) {
      this.logger.error(
        `recordStorageEvent failed for ${userId} (bytes=${bytes}, sign=${sign})`,
        err as any,
      );
      throw new InternalServerErrorException(
        `Failed to record storage event for ${userId}: ${err?.message ?? err}`,
      );
    }
  }
}
