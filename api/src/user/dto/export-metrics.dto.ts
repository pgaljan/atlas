import { IsDateString, IsOptional } from 'class-validator';

export class ExportMetricsDto {
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}