import { Module } from '@nestjs/common';
import { TermsOfServiceService } from './terms-of-service.service';
import { TermsOfServiceController } from './terms-of-service.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TermsOfServiceController],
  providers: [TermsOfServiceService],
})
export class TermsOfServiceModule {}
