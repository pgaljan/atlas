    import { Module } from '@nestjs/common';
    import { PrismaModule } from '../prisma/prisma.module';
    import { BackupController } from './backup.controller';
    import { BackupService } from './backup.service';
    import { StorageModule } from 'src/storage/storage.module';

    @Module({
      imports: [PrismaModule,StorageModule],
      providers: [BackupService],
      controllers: [BackupController],
    })
    export class BackupModule {}
