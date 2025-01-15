import { UpdateUserDto } from './dto/updateUser.dto';
import { UserService } from './user.service';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    getUser(id: string): Promise<{
        username: string;
        email: string;
        password: string;
        id: string;
        roleId: string;
        createdAt: Date;
        deletedAt: Date | null;
    }>;
    updateUser(id: string, updateUserDto: UpdateUserDto, req: any): Promise<{
        username: string;
        email: string;
        password: string;
        id: string;
        roleId: string;
        createdAt: Date;
        deletedAt: Date | null;
    }>;
    deleteUser(id: string, reason: string, req: any): Promise<{
        username: string;
        email: string;
        password: string;
        id: string;
        roleId: string;
        createdAt: Date;
        deletedAt: Date | null;
    }>;
    changePassword(id: string, oldPassword: string, newPassword: string, req: any): Promise<{
        username: string;
        email: string;
        password: string;
        id: string;
        roleId: string;
        createdAt: Date;
        deletedAt: Date | null;
    }>;
}
