import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePolicyDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;
}
