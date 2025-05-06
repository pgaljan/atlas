import { IsEmail, IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateUpdateAppSettingsDto {
  @IsString()
  @IsNotEmpty()
  appName: string;

  @IsUrl()
  logoUrl: string;

  @IsEmail()
  supportEmail: string;

  @IsUrl()
  feedbackLink: string;
}
