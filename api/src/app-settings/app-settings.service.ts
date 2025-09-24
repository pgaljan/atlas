import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUpdateAppSettingsDto } from './dto/create-update-app-settings.dto';
import { SmtpMailerService } from '../utils/smtp-mailer.util';

@Injectable()
export class AppSettingsService {
  private readonly logger = new Logger(AppSettingsService.name);
  constructor(private readonly prisma: PrismaService) {}

  async createOrUpdateSettings(data: CreateUpdateAppSettingsDto) {
    try {
      const existing = await this.prisma.appSettings.findFirst();

      const updateData: any = {
        appName: data.appName ?? existing?.appName ?? 'Atlas',
        primaryColor: data.primaryColor ?? existing?.primaryColor ?? '#660000',
        secondaryColor:
          data.secondaryColor ?? existing?.secondaryColor ?? '#006666',
        supportEmail: data.supportEmail ?? existing?.supportEmail ?? '',
        feedbackLink: data.feedbackLink ?? existing?.feedbackLink ?? '',
        logoUrl: data.logoUrl ?? existing?.logoUrl ?? '',
        inviteCodeOption:
          data.inviteCodeOption ?? existing?.inviteCodeOption ?? 'disabled',
        authProviders: data.authProviders
          ? JSON.parse(JSON.stringify(data.authProviders))
          : (existing?.authProviders ?? {
              local: true,
              google: false,
              github: false,
            }),
        smtpSettings: data.smtpSettings
          ? {
              ...((existing?.smtpSettings as Record<string, any>) ?? {}),
              ...JSON.parse(JSON.stringify(data.smtpSettings)),
            }
          : ((existing?.smtpSettings as Record<string, any>) ?? {}),
      };

      if (existing) {
        return await this.prisma.appSettings.update({
          where: { id: existing.id },
          data: updateData,
        });
      }

      return await this.prisma.appSettings.create({
        data: updateData,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to save settings: ${error.message}`,
      );
    }
  }

  async getSettings() {
    const settings = await this.prisma.appSettings.findFirst();

    if (!settings) {
      return {
        appName: 'Atlas',
        primaryColor: '#660000',
        secondaryColor: '#006666',
        supportEmail: '',
        feedbackLink: '',
        logoUrl: '',
        inviteCodeOption: 'disabled',
        authProviders: { local: true, google: false, github: false },
        smtpSettings: {},
      };
    }
    return settings;
  }

  async removeSettings(id: string) {
    try {
      const settings = await this.prisma.appSettings.findUnique({
        where: { id },
      });
      if (!settings) throw new NotFoundException('Settings not found');
      await this.prisma.appSettings.delete({ where: { id } });
      return { message: 'App settings deleted successfully' };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to delete settings: ${error.message}`,
      );
    }
  }

  async sendTestEmail(email: string) {
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRe.test(email.trim())) {
      throw new BadRequestException('Invalid recipient email');
    }
    const recipient = email.trim();

    try {
      const settings = await this.prisma.appSettings.findFirst();
      if (!settings) {
        throw new NotFoundException('No app settings found');
      }

      if (!settings.smtpSettings) {
        throw new BadRequestException('SMTP settings are not configured');
      }

      const smtpSettings = settings.smtpSettings as any;

      if (!smtpSettings.host) {
        throw new BadRequestException(
          'Incomplete SMTP configuration: host is required',
        );
      }

      if (smtpSettings.username && !smtpSettings.password) {
        throw new BadRequestException(
          'Incomplete SMTP configuration: password is required for provided username',
        );
      }

      const extraHeaders: Record<string, string> = {};
      if (smtpSettings.messageStream) {
        extraHeaders['X-PM-Message-Stream'] = smtpSettings.messageStream;
      }

      if (
        smtpSettings.extraHeaders &&
        typeof smtpSettings.extraHeaders === 'object'
      ) {
        Object.assign(extraHeaders, smtpSettings.extraHeaders);
      }

      const fromAddress =
        smtpSettings.fromEmail ||
        smtpSettings.fromAddress ||
        smtpSettings.username ||
        smtpSettings.serverToken;
      const fromName = smtpSettings.fromName || settings.appName || 'Atlas';

      if (
        !fromAddress ||
        typeof fromAddress !== 'string' ||
        !emailRe.test(fromAddress.trim())
      ) {
        throw new BadRequestException(
          'From address is not configured for SMTP',
        );
      }

      try {
        const mailer = new SmtpMailerService({
          host: smtpSettings.host,
          port: smtpSettings.port,
          encryption: smtpSettings.encryption,
          username: smtpSettings.username,
          password: smtpSettings.password,
          serverToken: smtpSettings.serverToken,
          fromEmail: fromAddress.trim(),
          fromName,
          tlsRejectUnauthorized: smtpSettings.tlsRejectUnauthorized,
          perRequestTransport: true,
          extraHeaders,
        });

        const info = await mailer.sendTestEmail(
          recipient,
          fromAddress.trim(),
          fromName,
        );

        return {
          message: 'Test email sent successfully',
          details: {
            messageId: info?.messageId,
            accepted: info?.accepted || [],
            rejected: info?.rejected || [],
            recipient,
            timestamp: new Date().toISOString(),
          },
        };
      } catch (smtpErr: any) {
        this.logger.warn('SMTP test email failed', smtpErr);

        const msg = smtpErr && smtpErr.message ? String(smtpErr.message) : '';
        const allowedUserMessages = [
          'Authentication failed',
          'Unable to connect to SMTP server',
          'Connection refused',
          'Connection timed out',
          'SMTP host not found',
          'Invalid recipient email format',
          'Invalid sender email format',
          'Failed to verify SMTP connection',
          'Failed to send test email',
        ];

        const matched = allowedUserMessages.find((m) => msg.includes(m));
        if (matched) {
          throw new BadRequestException(`SMTP Configuration Error: ${msg}`);
        }
        throw new BadRequestException(
          'SMTP Configuration Error: Unable to send test email. See server logs for details.',
        );
      }
    } catch (err: any) {
      if (
        err instanceof BadRequestException ||
        err instanceof NotFoundException
      ) {
        throw err;
      }
      this.logger.error('Unexpected error sending test email', err);
      throw new InternalServerErrorException('Failed to send test email');
    }
  }
}
