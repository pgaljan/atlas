import { IsEnum, IsJSON, IsObject, IsOptional } from 'class-validator';
import { EditorType, RendererType } from './record.enums';

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
  @IsEnum(RendererType, { message: 'Invalid renderer type' })
  renderer?: RendererType;

  @IsOptional()
  @IsJSON()
  recordSvg?: any;
}
