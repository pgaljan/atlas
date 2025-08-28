import { IsBoolean } from 'class-validator';

export class UpdateIsExpandedDto {
  @IsBoolean()
  isExpanded: boolean;
}
