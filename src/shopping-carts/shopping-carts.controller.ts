import { Body, Controller, Delete, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import RoleEnum from 'src/users/enums/role.enum';
import { UpdateShoppingCartDto } from './dtos/update-shopping-cart.dto';
import { ShoppingCartsService } from './shopping-carts.service';

@Controller('shopping-carts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ShoppingCartsController {
  constructor(private readonly shoppingCartsService: ShoppingCartsService) {}

  @Post('/add/:productId')
  @Roles(RoleEnum.Client)
  async add(@Param('productId') productId: string, @Req() req: Request) {
    return this.shoppingCartsService.add(req?.user['id'], productId);
  }

  @Put('/update/:productId')
  @Roles(RoleEnum.Client)
  async update(
    @Param('productId') productId: string,
    @Req() req: Request,
    @Body() updateShoppingCartDto: UpdateShoppingCartDto,
  ) {
    return this.shoppingCartsService.update(req?.user['id'], productId, updateShoppingCartDto);
  }

  @Delete('/delete/:productId')
  @Roles(RoleEnum.Client)
  async delete(@Param('productId') productId: string, @Req() req: Request) {
    return this.shoppingCartsService.delete(req?.user['id'], productId);
  }
}
