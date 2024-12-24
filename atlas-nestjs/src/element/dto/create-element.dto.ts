import {
  IsInt,
  IsOptional,
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateElementDto {
  @IsInt()
  @IsNotEmpty()
  structureId: number;

  @IsInt()
  @IsOptional()
  parentId?: number;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsOptional()
  @IsInt()
  recordId?: number;

  @IsInt()
  @IsNotEmpty()
  wbsLevel: number;

  @IsString()
  @IsNotEmpty()
  wbsNumber: string;

  @IsOptional()
  @IsString()
  markmapMM?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateElementDto)
  children?: CreateElementDto[];
}
