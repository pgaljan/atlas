import { Visibility } from '@prisma/client';

export class CreateStructureDto {
  id: string;
  name: string;
  description: string;
  visibility?: Visibility;
  title: string;
  imageUrl: string;
  ownerId: string;
  markmapShowWbs: boolean;
  elements?: CreateElementDto[];
  maps?: CreateStructureMapDto[];
  userId: any;
}

export class CreateElementDto {
  structureid: string;
  parentId?: number;
  name: string;
  recordId?: number;
}

export class AddChildElementDto {
  type: string;
  recordId?: number;
}

export class CreateStructureMapDto {
  name: string;
  description: string;
}
