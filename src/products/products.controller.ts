import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
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
import { AddCategoriesToProductDto } from './dtos/categories/add-categories-to-product.dto';
import { RemoveCategoriesFromProductDto } from './dtos/categories/remove-categories-from-product.dto';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async getProducts(
    @Query('q') q?: string,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip?: number,
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take?: number,
  ) {
    return this.productsService.findMany({ q, skip, take });
  }

  @Post('/:id/categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.Manager)
  addCategories(@Param('id', ParseUUIDPipe) id: string, @Body() input: AddCategoriesToProductDto) {
    return this.productsService.addCategories(id, input);
  }

  @Delete('/:id/categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.Manager)
  removeCategories(@Param('id', ParseUUIDPipe) id: string, @Body() input: RemoveCategoriesFromProductDto) {
    return this.productsService.removeCategories(id, input);
  }

  @Post()
  @Roles(RoleEnum.Manager)
  @UseGuards(JwtAuthGuard, RolesGuard)
  create(@Body() input: CreateProductDto) {
    return this.productsService.create(input);
  }

  @Get('/:id')
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findById(id);
  }

  @Put('/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.Manager)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() input: UpdateProductDto) {
    return this.productsService.update(id, input);
  }

  @Put('/:id/enabled')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.Manager)
  enable(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.enabled(id);
  }

  @Delete('/:id')
  @Roles(RoleEnum.Manager)
  @UseGuards(JwtAuthGuard, RolesGuard)
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.softDelete(id);
  }

  @Post('/:id/like')
  @Roles(RoleEnum.Client)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async like(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    return this.productsService.like(req?.user['id'], id);
  }

  @Post('/:id/dislike')
  @Roles(RoleEnum.Client)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async dislike(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    return this.productsService.dislike(req?.user['id'], id);
  }

  @Post('/:id/images')
  @Roles(RoleEnum.Manager)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          //new MaxFileSizeValidator({ maxSize: 10000 }),
          //new FileTypeValidator({ fileType: /\.(jpg|jpeg|png)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.productsService.addProductImage(id, file.buffer, file.originalname);
  }
}
