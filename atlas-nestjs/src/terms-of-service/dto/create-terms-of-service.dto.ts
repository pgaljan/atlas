import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTermsOfConditions {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;
}
