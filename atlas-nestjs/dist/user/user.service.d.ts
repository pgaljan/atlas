import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/updateUser.dto';
export declare class UserService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getUserById(id: number): Promise<{
        username: string;
        email: string;
        password: string;
        id: string;
        roleId: string;
        createdAt: Date;
        deletedAt: Date | null;
    }>;
    updateUser(id: number, updateUserDto: UpdateUserDto, userId: number): Promise<{
        username: string;
        email: string;
        password: string;
        id: string;
        roleId: string;
        createdAt: Date;
        deletedAt: Date | null;
    }>;
    deleteUser(id: number, reason: string, userId: number): Promise<{
        username: string;
        email: string;
        password: string;
        id: string;
        roleId: string;
        createdAt: Date;
        deletedAt: Date | null;
    }>;
    changePassword(id: number, oldPassword: string, newPassword: string, userId: number): Promise<{
        username: string;
        email: string;
        password: string;
        id: string;
        roleId: string;
        createdAt: Date;
        deletedAt: Date | null;
    }>;
}
