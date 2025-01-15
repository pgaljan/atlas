import { CreateElementDto } from './dto/create-element.dto';
import { ReparentElementsDto } from './dto/reparent-elements.dto';
import { UpdateElementDto } from './dto/update-element.dto';
import { ElementService } from './element.service';
export declare class ElementController {
    private readonly elementService;
    constructor(elementService: ElementService);
    createElement(createElementDto: CreateElementDto): Promise<{
        message: string;
    }>;
    createNestedElements(parentId: string, nestedElements: CreateElementDto | CreateElementDto[]): Promise<{
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
    getElement(id: string): Promise<{
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
    updateElement(id: string, updateElementDto: UpdateElementDto): Promise<{
        message: string;
    }>;
    reparentElements(reparentElementsDto: ReparentElementsDto): Promise<{
        message: string;
    }>;
    deleteElement(id: string): Promise<{
        message: string;
    }>;
}
