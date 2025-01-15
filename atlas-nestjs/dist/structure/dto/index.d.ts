import { Visibility } from '@prisma/client';
export declare class CreateStructureDto {
    id: number;
    name: string;
    description: string;
    visibility?: Visibility;
    ownerId: number;
    elements?: CreateElementDto[];
    maps?: CreateStructureMapDto[];
}
export declare class CreateElementDto {
    structureId: number;
    parentId?: number;
    type: string;
    recordId?: number;
    wbsLevel: number;
    markmapMM?: string;
}
export declare class AddChildElementDto {
    type: string;
    recordId?: number;
    wbsLevel: number;
    markmapMM?: string;
}
export declare class CreateStructureMapDto {
    name: string;
    description: string;
}
