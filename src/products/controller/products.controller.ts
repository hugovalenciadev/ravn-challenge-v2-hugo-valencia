import { Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import RoleEnum from 'src/users/enums/role.enum';
import { ProductsService } from '../products.service';

@Controller('products')
@UseGuards(RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post('/:productId/like')
  @UseGuards(JwtAuthGuard)
  @Roles(RoleEnum.Client)
  async like(@Param('productId') productId: string, @Req() req: Request) {
    return this.productsService.like(req?.user['id'], productId);
  }

  @Post('/:productId/dislike')
  @UseGuards(JwtAuthGuard)
  @Roles(RoleEnum.Client)
  async dislike(@Param('productId') productId: string, @Req() req: Request) {
    return this.productsService.dislike(req?.user['id'], productId);
  }
}
