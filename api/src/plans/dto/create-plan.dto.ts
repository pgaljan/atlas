import { IsString, IsDecimal, IsOptional, IsIn, IsInt } from 'class-validator';

export class CreatePlanDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsDecimal()
  price: number;

  @IsInt()
  order: number;

  features: Record<string, any>;

  @IsOptional()
  @IsIn(['active', 'inactive'], {
    message: 'Status must be either active or inactive',
  })
  status?: 'active' | 'inactive';
}
