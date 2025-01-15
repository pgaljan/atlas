import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleService } from './role.service';
export declare class RoleController {
    private readonly roleService;
    constructor(roleService: RoleService);
    createSubRoute(createRoleDto: CreateRoleDto): Promise<{
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
    updateSubRoute(id: string, updateRoleDto: UpdateRoleDto): Promise<{
        message: string;
    }>;
    deleteSubRoute(id: string): Promise<{
        message: string;
    }>;
}
