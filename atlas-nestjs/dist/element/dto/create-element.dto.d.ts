export declare class CreateElementDto {
    structureId: number;
    parentId?: number;
    type: string;
    recordId?: number;
    wbsLevel: number;
    markmapMM?: string;
    children?: CreateElementDto[];
}
