import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Order } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductsService } from 'src/products/products.service';
import { ShoppingCartsService } from 'src/shopping-carts/shopping-carts.service';
import { UsersService } from 'src/users/users.service';
import OrderStatus from './enums/order-status.enum';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly usersService: UsersService,
    private readonly shoppingCartsService: ShoppingCartsService,
  ) {}

  async findLast(userId: string): Promise<Order> {
    const userInstance = await this.usersService.findFirst({
      id: userId,
      enabled: true,
    });

    if (userInstance) {
      throw new BadRequestException('Bad Request', { cause: new Error(), description: 'User not exists.' });
    }

    const lastOrder = this.prismaService.order.findFirst({
      where: {
        shoppingCart: {
          user: {
            id: userId,
          },
        },
        status: OrderStatus.Created,
        enabled: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!lastOrder) {
      throw new NotFoundException('Not Found', { cause: new Error(), description: 'Order not exists.' });
    }

    return lastOrder;
  }
  async create(userId: string): Promise<Order> {
    const userInstance = await this.usersService.findFirst({
      id: userId,
      enabled: true,
    });

    if (userInstance) {
      throw new BadRequestException('Bad Request', { cause: new Error(), description: 'User not exists.' });
    }

    const shoppingCart = await this.shoppingCartsService.findFirstPendingByUser(userId);

    if (!shoppingCart || !shoppingCart?.shoppingCartDetails || shoppingCart?.shoppingCartDetails?.length == 0) {
      throw new BadRequestException('Shopping Cart is empty');
    }

    const orderTotal = shoppingCart.shoppingCartDetails
      .map((item) => item.product.price.times(item.quantity))
      .reduce((prev, next) => prev.plus(next));

    return await this.prismaService.order.create({
      data: {
        shoppingCartId: shoppingCart.id,
        status: OrderStatus.Created,
        total: orderTotal,
        orderDetails: {
          createMany: {
            data: shoppingCart.shoppingCartDetails.map((cd) => {
              return {
                price: cd.product.price,
                quantity: cd.quantity,
                productId: cd.productId,
              };
            }),
            skipDuplicates: true,
          },
        },
      },
      include: {
        orderDetails: {
          include: {
            product: true,
          },
        },
      },
    });
  }
}
