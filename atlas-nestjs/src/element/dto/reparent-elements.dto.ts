import {
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsArray,
  ArrayNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ReparentingRequestDto {
  @IsInt()
  @IsNotEmpty()
  sourceElementId: string;

  @IsInt()
  @IsNotEmpty()
  targetElementId: string;

  @IsObject()
  @IsOptional()
  attributes?: Record<string, any>;
}

export class ReparentElementsDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ReparentingRequestDto)
  reparentingRequests: ReparentingRequestDto[];
}
