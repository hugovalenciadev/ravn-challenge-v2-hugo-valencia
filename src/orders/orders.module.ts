import { Module } from '@nestjs/common';
import { ProductsModule } from 'src/products/products.module';
import { ShoppingCartsModule } from 'src/shopping-carts/shopping-carts.module';
import { UsersModule } from 'src/users/users.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [ProductsModule, UsersModule, ShoppingCartsModule],
  providers: [OrdersService],
  exports: [OrdersService],
  controllers: [OrdersController],
})
export class OrdersModule {}
