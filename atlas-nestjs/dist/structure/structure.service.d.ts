import { PrismaService } from '../prisma/prisma.service';
import { CreateStructureDto } from './dto';
export declare class StructureService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createStructure(createStructureDto: CreateStructureDto): Promise<{
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
    getStructure(id: number): Promise<{
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
    updateStructure(id: number, updateData: Partial<CreateStructureDto>): Promise<{
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
    deleteStructure(id: number): Promise<{
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
    createBatchStructures(structures: CreateStructureDto[]): Promise<{
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
    }[]>;
    updateBatchStructures(structures: Partial<CreateStructureDto>[]): Promise<{
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
    }[]>;
    deleteBatchStructures(ids: number[]): Promise<{
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
    }[]>;
}
