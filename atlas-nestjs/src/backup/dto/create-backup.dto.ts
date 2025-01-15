import { IsInt, IsString, IsOptional, isString } from 'class-validator';

export class CreateBackupDto {
  @IsInt()
  userId: string;
}

export class BackupResponseDto {
  @IsString()
  message: string;

  @IsString()
  backupFilePath: string;

  @IsString()
  fileUrl: string;
}
