import { Module } from '@nestjs/common';
import { AdministratorAuthService } from './administrator-auth.service';
import { AdministratorAuthController } from './administrator-auth.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '24h' },  
    }),
  ],
  controllers: [AdministratorAuthController],
  providers: [AdministratorAuthService],
})
export class AdministratorAuthModule {}
