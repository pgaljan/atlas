import { IsObject, IsOptional } from 'class-validator';

export class UpdateRecordDto {
  @IsOptional()
  metadata?: object;

  @IsOptional()
  @IsObject()
  tags?: { [key: string]: string };
}
