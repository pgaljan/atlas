// dto/search-query.dto.ts
import {
  IsIn,
  IsOptional,
  IsString,
  IsISO8601,
  IsNotEmpty,
} from 'class-validator';

export class SearchQueryDto {
  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @IsIn(['createdAt', 'updatedAt', 'title'])
  sortBy?: 'createdAt' | 'updatedAt' | 'title';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc';
}

export class SearchDateQueryDto extends SearchQueryDto {
  @IsNotEmpty()
  @IsISO8601()
  date: string;
}
