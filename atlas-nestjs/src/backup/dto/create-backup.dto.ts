import { IsInt, IsString, IsOptional, isString } from 'class-validator';

export class CreateBackupDto {
  @IsInt()
  userId: number;
}

export class BackupResponseDto {
  @IsString()
  message: string;

  @IsString()
  backupFilePath: string;

  @IsString()
  fileUrl: string;
}
