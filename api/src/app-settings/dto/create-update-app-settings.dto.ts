import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum InviteCodeOption {
  DISABLED = 'disabled',
  ENABLED = 'enabled',
  REQUIRED = 'required',
}

class AuthProvidersDto {
  @IsOptional()
  local?: boolean;

  @IsOptional()
  google?: boolean;

  @IsOptional()
  github?: boolean;
}

export class SmtpSettingsDto {
  @IsString()
  @IsNotEmpty({ message: 'SMTP Host is required' })
  host: string;

  @IsOptional()
  port?: number;

  @IsString()
  @IsOptional()
  encryption?: 'TLS' | 'SSL';

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  serverToken?: string;

  @IsEmail()
  @IsOptional()
  fromAddress?: string;

  @IsString()
  @IsOptional()
  fromName?: string;

  @IsString()
  @IsOptional()
  subjectPrefix?: string;

  @IsString()
  @IsOptional()
  messageStream?: string;
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

  @ValidateNested()
  @Type(() => AuthProvidersDto)
  @IsOptional()
  authProviders?: AuthProvidersDto;

  @ValidateNested()
  @Type(() => SmtpSettingsDto)
  @IsOptional()
  smtpSettings?: SmtpSettingsDto;
}
