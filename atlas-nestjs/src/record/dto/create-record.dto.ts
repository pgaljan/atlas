import { IsNotEmpty, IsOptional, IsEnum, IsObject, IsJSON } from 'class-validator';

export enum EditorType {
  VSCODE = 'vscode',
  MARKEDDOWN = 'markeddown',
  QUILLEDITOR = 'quilleditor',
}

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
  @IsJSON()
  recordSvg?: any;
}
