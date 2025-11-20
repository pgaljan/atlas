import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuditService } from './audit.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);
  private readonly cooldownMs = 2000;

  constructor(
    private readonly auditService: AuditService,
    private readonly prisma: PrismaService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const user = request.user || {};
    const userId = user.id || null;

    // Only intercept mutating requests (optional)
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle();
    }

    const startTime = Date.now();

    return next.handle().pipe(
      tap(async () => {
        try {
          const duration = Date.now() - startTime;
          this.logger.debug(
            `AuditInterceptor: handled ${method} in ${duration}ms`,
          );

          await new Promise((res) => setTimeout(res, 300));

          const latest = await this.prisma.auditLog.findFirst({
            where: {
              userId,
              createdAt: { gte: new Date(Date.now() - this.cooldownMs) },
            },
            orderBy: { createdAt: 'desc' },
          });

          if (!latest) return;

          const blobExists =
            await this.auditService.checkIfAuditAlreadyUploaded(latest.id);
          if (blobExists) {
            this.logger.debug(
              `AuditInterceptor: skipping already-uploaded audit ${latest.id}`,
            );
            return;
          }

          await this.auditService.uploadAuditRow(latest);
        } catch (err) {
          this.logger.warn('AuditInterceptor failed to upload audit:', err);
        }
      }),
    );
  }
}
