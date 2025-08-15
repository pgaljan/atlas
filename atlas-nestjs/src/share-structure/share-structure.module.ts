import { Module } from '@nestjs/common';
import { StructureSharesService } from './share-structure.service';
import { StructureSharesController } from './share-structure.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MailerService } from 'src/utils/mailer.util';

@Module({
  imports: [PrismaModule],
  controllers: [StructureSharesController],
  providers: [StructureSharesService, MailerService],
})
export class ShareStructureModule {}
