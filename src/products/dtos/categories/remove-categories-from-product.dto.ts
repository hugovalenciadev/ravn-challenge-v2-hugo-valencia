import { IsUUID } from 'class-validator';
import { AddCategoriesToProductDto } from './add-categories-to-product.dto';

export class RemoveCategoriesFromProductDto {
  @IsUUID('4', { each: true })
  categoryIds: string[];
}
