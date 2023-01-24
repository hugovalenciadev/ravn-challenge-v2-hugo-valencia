import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsOptional, IsPositive, IsInt, ValidateNested, ArrayNotEmpty } from 'class-validator';

class CategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsInt()
  @IsPositive()
  quantity: number;

  @IsPositive()
  price: number;

  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CategoryDto)
  categories: CategoryDto[];
}
