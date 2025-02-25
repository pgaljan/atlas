import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BackupModule } from './backup/backup.module';
import { ElementModule } from './element/element.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { PlansModule } from './plans/plans.module';
import { PrismaModule } from './prisma/prisma.module';
import { RecordModule } from './record/record.module';
import { RestoreBackupModule } from './restore-backup/restore-backup.module';
import { RoleModule } from './role/role.module';
import { StructureModule } from './structure/structure.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    UserModule,
    AuthModule,
    PrismaModule,
    RoleModule,
    PlansModule,
    FileUploadModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/public',
    }),
    StructureModule,
    ElementModule,
    RecordModule,
    BackupModule,
    RestoreBackupModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
