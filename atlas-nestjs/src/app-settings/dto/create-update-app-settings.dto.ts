import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsEnum,
  IsObject,
} from 'class-validator';

export enum InviteCodeOption {
  DISABLED = 'disabled',
  ENABLED = 'enabled',
  REQUIRED = 'required',
}

export class CreateUpdateAppSettingsDto {
  @IsString()
  @IsNotEmpty()
  appName: string;

  @IsString()
  @IsOptional()
  primaryColor?: string;

  @IsString()
  @IsOptional()
  secondaryColor?: string;

  @IsUrl()
  @IsOptional()
  logoUrl?: string;

  @IsEmail()
  @IsOptional()
  supportEmail?: string;

  @IsUrl()
  @IsOptional()
  feedbackLink?: string;

  @IsEnum(InviteCodeOption)
  @IsOptional()
  inviteCodeOption?: InviteCodeOption;

  @IsObject()
  @IsOptional()
  authProviders?: {
    local: boolean;
    google: boolean;
    github: boolean;
  };
}
