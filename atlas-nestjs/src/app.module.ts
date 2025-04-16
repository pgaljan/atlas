import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BackupModule } from './backup/backup.module';
import { ElementModule } from './element/element.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { InvitationModule } from './invitations/invitations.module';
import { PlansModule } from './plans/plans.module';
import { PrismaModule } from './prisma/prisma.module';
import { RecordModule } from './record/record.module';
import { RestoreBackupModule } from './restore-backup/restore-backup.module';
import { RoleModule } from './role/role.module';
import { StructureCataloguesModule } from './structure-catalogues/structure-catalogues.module';
import { StructureModule } from './structure/structure.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { TeamMemberModule } from './team-member/team-member.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    UserModule,
    AuthModule,
    PrismaModule,
    RoleModule,
    PlansModule,
    FileUploadModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/api/public',
    }),
    StructureModule,
    ElementModule,
    RecordModule,
    BackupModule,
    RestoreBackupModule,
    SubscriptionsModule,
    TeamMemberModule,
    InvitationModule,
    StructureCataloguesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
