import {
  IsInt,
  IsOptional,
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsIn,
  IsObject,
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
  eventValue?: string;

  @IsOptional()
  @IsIn(['P', 'λ'])
  eventValueType?: string;

  @IsOptional()
  @Type(() => Number)
  mttr?: number;

  @IsOptional()
  @Type(() => Number)
  missionTime?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  inputK?: number;

  @IsOptional()
  @IsInt()
  outputN?: number;

  @IsOptional()
  @IsObject()
  tags?: Record<string, string>;

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
