import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import RoleEnum from 'src/users/enums/role.enum';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
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

  @Put('/:id')
  @Roles(RoleEnum.Manager)
  update(@Param('id') id: string, @Body() input: UpdateProductDto) {
    return this.productsService.update(id, input);
  }

  @Delete('/:id')
  @Roles(RoleEnum.Manager)
  delete(@Param('id') id: string) {
    return this.productsService.softDelete(id);
  }

  @Post('/:id/like')
  @UseGuards(JwtAuthGuard)
  @Roles(RoleEnum.Client)
  async like(@Param('id') id: string, @Req() req: Request) {
    return this.productsService.like(req?.user['id'], id);
  }

  @Post('/:id/dislike')
  @UseGuards(JwtAuthGuard)
  @Roles(RoleEnum.Client)
  async dislike(@Param('id') id: string, @Req() req: Request) {
    return this.productsService.dislike(req?.user['id'], id);
  }

  @Post('/:id/images')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(JwtAuthGuard)
  @Roles(RoleEnum.Manager)
  async uploadFile(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    return this.productsService.addProductImage(id, file.buffer, file.originalname);
  }
}
