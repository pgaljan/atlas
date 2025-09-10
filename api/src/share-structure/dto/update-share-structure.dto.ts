import { IsEnum, IsOptional } from 'class-validator';
import { SharePermissionDto } from './create-share-structure.dto';

export class UpdateShareDto {
  @IsOptional()
  @IsEnum(SharePermissionDto)
  permission?: SharePermissionDto;
}
