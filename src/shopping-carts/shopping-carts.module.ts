import { Module } from '@nestjs/common';
import { ProductsModule } from 'src/products/products.module';
import { UsersModule } from 'src/users/users.module';
import { ShoppingCartsController } from './shopping-carts.controller';
import { ShoppingCartsService } from './shopping-carts.service';

@Module({
  imports: [ProductsModule, UsersModule],
  providers: [ShoppingCartsService],
  exports: [ShoppingCartsModule],
  controllers: [ShoppingCartsController],
})
export class ShoppingCartsModule {}
