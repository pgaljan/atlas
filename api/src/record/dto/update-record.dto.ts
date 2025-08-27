import { IsEnum, IsJSON, IsObject, IsOptional } from 'class-validator';
import { EditorType } from './record.enums';

export class UpdateRecordDto {
  @IsOptional()
  metadata?: object;

  @IsOptional()
  @IsObject()
  tags?: { [key: string]: string };

  @IsOptional()
  @IsEnum(EditorType, { message: 'Invalid editor type' })
  editorType?: EditorType;

  @IsOptional()
  @IsJSON()
  recordSvg?: any;
}
