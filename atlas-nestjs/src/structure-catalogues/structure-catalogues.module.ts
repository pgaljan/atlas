import { Module } from '@nestjs/common';
import { StructureCataloguesController } from './structure-catalogues.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { StructureCataloguesService } from './structure-catalogues.service';

@Module({
  imports: [PrismaModule],
  controllers: [StructureCataloguesController],
  providers: [StructureCataloguesService],
})
export class StructureCataloguesModule {}
