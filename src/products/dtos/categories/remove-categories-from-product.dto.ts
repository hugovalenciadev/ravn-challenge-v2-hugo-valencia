import { IsUUID } from 'class-validator';

export class RemoveCategoriesFromProductDto {
  @IsUUID('4', { each: true })
  categoryIds: string[];
}
