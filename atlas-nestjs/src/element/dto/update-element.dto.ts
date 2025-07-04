import { Type } from 'class-transformer';
import { IsOptional, IsString, IsIn } from 'class-validator';

export class UpdateElementDto {
  @IsString()
  id: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @IsString()
  recordId?: string;

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
  @IsIn(['P', 'A'])
  eventValueType?: string;

  @IsOptional()
  @Type(() => Boolean)
  isExpanded?: boolean;

  @IsOptional()
  @IsString()
  markmapMM?: string;
}
