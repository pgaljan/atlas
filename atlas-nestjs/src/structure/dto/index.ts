import { Visibility } from '@prisma/client';

export class CreateStructureDto {
  id: number;
  name: string;
  description: string;
  visibility?: Visibility;
  ownerId: number;
  elements?: CreateElementDto[];
  maps?: CreateStructureMapDto[];
}

export class CreateElementDto {
  structureId: number;
  parentId?: number;
  type: string;
  recordId?: number;
  wbsLevel: number;
  wbsNumber: string; 
  markmapMM?: string;
}

export class AddChildElementDto {
  type: string;
  recordId?: number;
  wbsLevel: number;
  wbsNumber: string;
  markmapMM?: string;
}

export class CreateStructureMapDto {
  name: string;
  description: string;
}
