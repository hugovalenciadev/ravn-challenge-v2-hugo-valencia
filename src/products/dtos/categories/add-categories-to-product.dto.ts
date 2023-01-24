import { Type } from 'class-transformer';
import { ValidateNested, ArrayNotEmpty } from 'class-validator';
import { CategoryDto } from './category.dto';

export class AddCategoriesToProductDto {
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CategoryDto)
  categories: CategoryDto[];
}
