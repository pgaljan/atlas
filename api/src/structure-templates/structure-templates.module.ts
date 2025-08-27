import { Module } from '@nestjs/common';
import { StructureTemplateController } from './structure-templates.controller';
import { StructureTemplateService } from './structure-templates.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StructureTemplateController],
  providers: [StructureTemplateService],
})
export class StructureTemplatesModule {}
