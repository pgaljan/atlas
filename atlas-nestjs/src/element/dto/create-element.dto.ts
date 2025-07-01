import {
  IsInt,
  IsOptional,
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateElementDto {
  @IsString()
  @IsNotEmpty()
  structureId: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  eventType?: string;

  @IsOptional()
  @IsString()
  gateType?: string;

  @IsOptional()
  @IsString()
  eventCode?: string;

  @IsOptional()
  @IsIn(['P', 'λ'])
  status?: string;

  @IsOptional()
  @IsString()
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
