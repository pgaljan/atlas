import { IsNotEmpty, IsObject, IsOptional } from 'class-validator';

export class CreateRecordDto {
  @IsNotEmpty()
  metadata: object;

  @IsOptional()
  @IsObject()
  tags?: { [key: string]: string };
}
