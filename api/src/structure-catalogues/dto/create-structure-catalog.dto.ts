import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateStructureCatalogDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @IsString()
  fileUrl?: string;

  @IsInt()
  order: number;

  @IsArray()
  @IsString({ each: true })
  userTier: string[];

  @IsOptional()
  @IsString()
  workspaceId?: string;
}
