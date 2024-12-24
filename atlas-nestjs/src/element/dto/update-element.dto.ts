import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateElementDto {
  @IsInt()
  id: number;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsInt()
  recordId?: number;

  @IsOptional()
  @IsInt()
  wbsLevel?: number;

  @IsOptional()
  @IsString()
  wbsNumber?: string;

  @IsOptional()
  @IsString()
  markmapMM?: string;
}
