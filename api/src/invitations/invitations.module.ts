import { Module } from '@nestjs/common';
import { InvitationController } from './invitations.controller';
import { InvitationService } from './invitations.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MailerService } from 'src/utils/mailer.util';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [PrismaModule],
  controllers: [InvitationController],
  providers: [InvitationService, MailerService, PrismaService],
  exports: [InvitationService],
})
export class InvitationModule {}
