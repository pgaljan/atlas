import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum SharePermissionDto {
  editor = 'editor',
  commenter = 'commenter',
  viewer = 'viewer',
}

export class CreateShareDto {
  @IsString()
  @IsNotEmpty()
  structureId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsEnum(SharePermissionDto)
  permission: SharePermissionDto;
}
