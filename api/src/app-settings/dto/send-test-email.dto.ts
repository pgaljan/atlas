import { IsEmail, IsNotEmpty } from 'class-validator';

export class SendTestEmailDto {
  @IsEmail()
  @IsNotEmpty({ message: 'Email address is required' })
  email: string;
}
