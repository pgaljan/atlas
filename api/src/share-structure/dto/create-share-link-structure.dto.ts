import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { SharePermissionDto } from './create-share-structure.dto';

export class CreateShareLinkDto {
  @IsString()
  @IsNotEmpty()
  structureId: string;

  @IsEnum(SharePermissionDto)
  permission: SharePermissionDto;

  @IsOptional()
  @IsString()
  expiresAt?: string; 
}
