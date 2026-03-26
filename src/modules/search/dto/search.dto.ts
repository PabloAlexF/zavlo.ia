import { IsString, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchTextDto {
  @IsString()
  query: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsString()
  useRealScraping?: string;
}

export class SearchImageDto {
  @IsString()
  imageUrl: string;
}
