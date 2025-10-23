import {
  IsArray,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class TechnologyDto {
  @IsString()
  name: string;

  @IsString()
  type: 'Core' | 'Peripheral';
}

export class ExperienceDto {
  @IsString()
  organizationName: string;

  @IsString()
  role: string;

  @IsString()
  location: string;

  @IsString()
  startDate: string; // 'YYYY-MM'

  @IsString()
  endDate: string; // 'YYYY-MM' or ''

  @IsOptional()
  @IsArray()
  internalStakeholders?: string[];

  @IsOptional()
  @IsArray()
  externalStakeholders?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TechnologyDto)
  technologies: TechnologyDto[];

  @IsArray()
  keySkills: string[];

  @IsArray()
  competencies: string[];

  @IsArray()
  projectTypes: string[];

  @IsArray()
  achievements: string[];

  @IsString()
  description: string;
}

export class CreateLearnerProfileDto {
  @IsString()
  @IsNotEmpty()
  userName: string;

  @IsString()
  @IsNotEmpty()
  userGoals: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExperienceDto)
  experiences: ExperienceDto[];

  @IsISO8601()
  exportDate: string; // date-time

  @IsString()
  version: string;
}
