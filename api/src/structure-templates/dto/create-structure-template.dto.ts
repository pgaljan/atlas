import { StructureType } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsArray,
} from 'class-validator';

export class CreateStructureTemplateDto {
  @IsOptional()
  id?: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(StructureType)
  @IsOptional()
  structureType?: StructureType;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @IsOptional()
  structureId?: string;

  @IsString()
  ownerId: string;

  @IsOptional()
  workspaceId?: string;

  @IsOptional()
  thumbnailUrl?: string;

  @IsOptional()
  fileUrl?: string;

  structureJson: any;
}
