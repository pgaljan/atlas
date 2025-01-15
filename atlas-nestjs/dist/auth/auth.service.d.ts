import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
export declare class AuthService {
    private readonly jwtService;
    private readonly prismaService;
    constructor(jwtService: JwtService, prismaService: PrismaService);
    private logAudit;
    register(registerDto: RegisterDto): Promise<{
        user: {
            email: string;
            sub: string;
        };
    }>;
    validateUser(email: string, password: string): Promise<{
        username: string;
        email: string;
        password: string;
        id: string;
        roleId: string;
        createdAt: Date;
        deletedAt: Date | null;
    }>;
    login(user: any): Promise<{
        message: string;
        user: {
            id: any;
            email: any;
            username: any;
            role: any;
        };
        access_token: string;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        message: string;
        access_token: string;
    }>;
    logout(user: any): Promise<void>;
}
