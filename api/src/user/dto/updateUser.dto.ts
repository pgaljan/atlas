import {
  IsString,
  IsOptional,
  IsEmail,
  IsBoolean,
  IsNumber,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString({ message: 'Role must be a string.' })
  role?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsBoolean({ message: 'isAdmin must be a boolean.' })
  isAdmin?: boolean;

  @IsOptional()
  @IsNumber({}, { message: 'inviteCount must be a number.' })
  inviteCount?: number;
}
