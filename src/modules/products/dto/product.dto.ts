import { IsString, IsNumber, IsOptional, IsArray, IsEnum } from 'class-validator';

export class CreateProductDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsNumber()
  price: number;

  @IsArray()
  images: string[];

  @IsString()
  category: string;

  @IsString()
  source: string;

  @IsString()
  sourceUrl: string;

  @IsString()
  state: string;

  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  cep?: string;

  @IsString()
  sellerName: string;

  @IsOptional()
  @IsString()
  sellerPhone?: string;

  @IsOptional()
  @IsEnum(['new', 'used'])
  condition?: 'new' | 'used';
}

export class FilterProductsDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsNumber()
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  maxPrice?: number;

  @IsOptional()
  @IsString()
  condition?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
