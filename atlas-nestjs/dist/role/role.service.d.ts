import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
export declare class RoleService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createRoleDto: CreateRoleDto): Promise<{
        message: string;
    }>;
    findAll(): Promise<{
        id: string;
        name: string;
        description: string | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        description: string | null;
    }>;
    update(id: string, updateRoleDto: UpdateRoleDto): Promise<{
        message: string;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
