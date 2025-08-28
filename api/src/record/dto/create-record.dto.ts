import {
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsObject,
  IsJSON,
} from 'class-validator';
import { EditorType, RendererType } from './record.enums';

export class CreateRecordDto {
  @IsNotEmpty()
  metadata: object;

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
