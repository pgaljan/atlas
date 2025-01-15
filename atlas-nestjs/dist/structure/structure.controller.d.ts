import { CreateStructureDto } from './dto';
import { StructureService } from './structure.service';
export declare class StructureController {
    private readonly structureService;
    constructor(structureService: StructureService);
    createStructure(createStructureDto: CreateStructureDto): Promise<{
        message: string;
    }>;
    getStructure(id: string): Promise<{
        elements: any;
        id: string;
        createdAt: Date;
        deletedAt: Date | null;
        name: string;
        description: string | null;
        updatedAt: Date;
        markmapMM: string | null;
        ownerId: string;
        visibility: import(".prisma/client").$Enums.Visibility;
        wbsPrefix: string;
    }>;
    updateStructure(id: string, updateData: Partial<CreateStructureDto>): Promise<{
        message: string;
    }>;
    deleteStructure(id: string): Promise<{
        message: string;
    }>;
    createBatchStructures(structures: CreateStructureDto[]): Promise<{
        message: string;
    }>;
    updateBatchStructures(structures: Partial<CreateStructureDto>[]): Promise<{
        message: string;
    }>;
    deleteBatchStructures(ids: number[]): Promise<{
        message: string;
    }>;
}
