import { PrismaService } from '../prisma/prisma.service';
import { CreateElementDto } from './dto/create-element.dto';
import { ReparentElementsDto } from './dto/reparent-elements.dto';
import { UpdateElementDto } from './dto/update-element.dto';
export declare class ElementService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private logAudit;
    createElement(createElementDto: CreateElementDto, userId?: number): Promise<{
        id: string;
        createdAt: Date;
        deletedAt: Date | null;
        updatedAt: Date;
        structureId: string;
        parentId: string | null;
        type: string | null;
        recordId: string | null;
        wbsLevel: number | null;
        markmapMM: string | null;
        Guid: string;
        uniqWBS: string | null;
        parsedContentId: string | null;
        elementLinkId: string | null;
    }>;
    createNestedElements(parentId: number, nestedElements: CreateElementDto[]): Promise<{
        message: string;
    }>;
    getAllElements(): Promise<{
        id: string;
        createdAt: Date;
        deletedAt: Date | null;
        updatedAt: Date;
        structureId: string;
        parentId: string | null;
        type: string | null;
        recordId: string | null;
        wbsLevel: number | null;
        markmapMM: string | null;
        Guid: string;
        uniqWBS: string | null;
        parsedContentId: string | null;
        elementLinkId: string | null;
    }[]>;
    getElement(id: number): Promise<{
        id: string;
        createdAt: Date;
        deletedAt: Date | null;
        updatedAt: Date;
        structureId: string;
        parentId: string | null;
        type: string | null;
        recordId: string | null;
        wbsLevel: number | null;
        markmapMM: string | null;
        Guid: string;
        uniqWBS: string | null;
        parsedContentId: string | null;
        elementLinkId: string | null;
    }>;
    updateElement(id: number, updateElementDto: UpdateElementDto, userId?: number): Promise<{
        id: string;
        createdAt: Date;
        deletedAt: Date | null;
        updatedAt: Date;
        structureId: string;
        parentId: string | null;
        type: string | null;
        recordId: string | null;
        wbsLevel: number | null;
        markmapMM: string | null;
        Guid: string;
        uniqWBS: string | null;
        parsedContentId: string | null;
        elementLinkId: string | null;
    }>;
    reparentElements(ReparentElementsDto: ReparentElementsDto, userId?: number): Promise<{
        message: string;
        updatedElements: any[];
    }>;
    deleteElement(id: number, userId?: number): Promise<{
        id: string;
        createdAt: Date;
        deletedAt: Date | null;
        updatedAt: Date;
        structureId: string;
        parentId: string | null;
        type: string | null;
        recordId: string | null;
        wbsLevel: number | null;
        markmapMM: string | null;
        Guid: string;
        uniqWBS: string | null;
        parsedContentId: string | null;
        elementLinkId: string | null;
    }>;
}
