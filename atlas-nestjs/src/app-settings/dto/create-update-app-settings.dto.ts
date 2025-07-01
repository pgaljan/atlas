import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateUpdateAppSettingsDto {
  @IsString()
  @IsNotEmpty()
  appName: string;

  @IsString()
  @IsOptional()
  primaryColor: string;

  @IsString()
  @IsOptional()
  secondaryColor: string;

  @IsUrl()
  logoUrl: string;

  @IsEmail()
  supportEmail: string;

  @IsUrl()
  feedbackLink: string;
}
