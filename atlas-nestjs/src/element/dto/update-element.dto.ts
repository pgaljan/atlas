import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateElementDto {
  @IsInt()
  id: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsInt()
  @IsOptional()
  parentId?: string;

  @IsOptional()
  @IsInt()
  recordId?: string;

  @IsOptional()
  @IsInt()
  wbsLevel?: number;

  @IsOptional()
  @Type(() => Boolean)  
  isExpanded?: boolean;

  @IsOptional()
  @IsString()
  markmapMM?: string;
}
