import { IsInt } from 'class-validator';

export class UpdateStructureCatalogOrderDto {
  @IsInt()
  order: number;
}
