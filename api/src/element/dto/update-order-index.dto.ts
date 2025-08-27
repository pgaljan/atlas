import { IsNumber } from 'class-validator';

export class UpdateOrderIndexDto {
  @IsNumber()
  orderIndex: number;
}
