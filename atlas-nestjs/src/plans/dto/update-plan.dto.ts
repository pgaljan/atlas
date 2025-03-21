import { IsOptional, IsIn } from 'class-validator';

export class UpdatePlanDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  price?: number;

  @IsOptional()
  features?: Record<string, any>;

  @IsOptional()
  @IsIn(['active', 'inactive'], { message: 'Status must be either active or inactive' })
  status?: 'active' | 'inactive';
}
