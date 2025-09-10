import { IsInt, IsString, IsOptional, isString } from 'class-validator';

export class CreateBackupDto {
  @IsInt()
  userId: string;

  @IsString()
  type: string;
}

export class BackupResponseDto {
  @IsString()
  message: string;

  @IsString()
  title: string;

  @IsString()
  backupFilePath: string;

  @IsString()
  fileUrl: string;
}
