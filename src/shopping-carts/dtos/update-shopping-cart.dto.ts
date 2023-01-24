import { IsEmail, IsIn, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class UpdateShoppingCartDto {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  quantity: number;
}
