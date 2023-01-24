import { Body, Controller, Param, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import RoleEnum from 'src/users/enums/role.enum';
import { CreateProductDto } from './dtos/create-product.dto';
import { ProductsService } from './products.service';

@Controller('products')
@UseGuards(RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(RoleEnum.Manager)
  create(@Body() input: CreateProductDto) {
    return this.productsService.create(input);
  }

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

  @Post('/:productId/images')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(JwtAuthGuard)
  @Roles(RoleEnum.Manager)
  async uploadFile(@Param('productId') productId: string, @UploadedFile() file: Express.Multer.File) {
    return this.productsService.addProductImage(productId, file.buffer, file.originalname);
  }
}
