import { IsOptional, IsString } from 'class-validator';

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

  @IsString()
  userTier: string;

  @IsOptional()
  @IsString()
  workspaceId?: string;
}
