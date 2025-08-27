import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateStructureCatalogDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @IsString()
  fileUrl?: string;

  @IsOptional()            
  @IsInt()
  order?: number;

  @IsOptional()            
  @IsArray()
  @IsString({ each: true })
  userTier?: string[];

  @IsOptional()
  @IsString()
  workspaceId?: string;
}
