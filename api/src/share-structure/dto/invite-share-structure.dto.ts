import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { SharePermissionDto } from './create-share-structure.dto';

export class InviteShareDto {
  @IsString()
  @IsNotEmpty()
  structureId: string;

  @IsString()
  @IsNotEmpty()
  inviteeUsername: string;

  @IsEnum(SharePermissionDto)
  permission: SharePermissionDto;

  @IsOptional()
  @IsString()
  message?: string;
}
