import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { SharePermissionDto } from './create-share-structure.dto';

export class InviteShareDto {
  @IsString()
  @IsNotEmpty()
  structureId: string;

  @IsEmail()
  inviteeEmail: string;

  @IsEnum(SharePermissionDto)
  permission: SharePermissionDto;

  @IsOptional()
  @IsString()
  message?: string;
}
