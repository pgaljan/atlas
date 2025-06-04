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
  structureId: string;

  @IsInt()
  @IsOptional()
  parentId?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsInt()
  recordId?: string;

  @IsOptional()
  @Type(() => Boolean)
  isExpanded?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateElementDto)
  children?: CreateElementDto[];
}
