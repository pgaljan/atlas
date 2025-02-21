import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateElementDto {
  @IsInt()
  id: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  recordId?: string;

  @IsOptional()
  @IsInt()
  wbsLevel?: number;

  @IsOptional()
  @IsString()
  markmapMM?: string;
}
