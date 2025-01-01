import { IsString, IsDecimal } from 'class-validator';

export class CreatePlanDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsDecimal()
  price: number;

  features: Record<string, any>;
}
