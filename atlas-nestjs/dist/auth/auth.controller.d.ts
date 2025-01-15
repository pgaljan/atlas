import { Request as ExpressRequest } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        message: string;
    }>;
    login(req: ExpressRequest): Promise<{
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
    logout(req: ExpressRequest): Promise<{
        message: string;
    }>;
}
