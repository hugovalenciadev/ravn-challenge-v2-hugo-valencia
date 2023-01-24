import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Order, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import ShoppingCartStatus from 'src/shopping-carts/enums/shopping-cart-status.enum';
import { ShoppingCartsService } from 'src/shopping-carts/shopping-carts.service';
import { UsersService } from 'src/users/users.service';
import OrderStatus from './enums/order-status.enum';

export type OrderWithDetails = Prisma.OrderGetPayload<{
  include: {
    orderDetails: {
      include: {
        product: true;
      };
    };
  };
}>;

@Injectable()
export class OrdersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly usersService: UsersService,
    private readonly shoppingCartsService: ShoppingCartsService,
  ) {}

  async findLast(userId: string): Promise<OrderWithDetails> {
    const userInstance = await this.usersService.findFirst({
      id: userId,
      enabled: true,
    });

    if (!userInstance) {
      throw new BadRequestException('Bad Request', { cause: new Error(), description: 'User not exists.' });
    }

    const lastOrder = await this.prismaService.order.findFirst({
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
      include: {
        orderDetails: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!lastOrder) {
      throw new NotFoundException('Not Found', { cause: new Error(), description: 'Order not found.' });
    }

    return lastOrder;
  }
  async create(userId: string): Promise<OrderWithDetails> {
    const userInstance = await this.usersService.findFirst({
      id: userId,
      enabled: true,
    });

    if (!userInstance) {
      throw new BadRequestException('Bad Request', { cause: new Error(), description: 'User not exists.' });
    }

    const shoppingCart = await this.shoppingCartsService.findFirstPendingByUser(userId);

    if (!shoppingCart || !shoppingCart?.shoppingCartDetails || shoppingCart?.shoppingCartDetails?.length == 0) {
      throw new BadRequestException('Shopping Cart is empty');
    }

    return await this.prismaService.$transaction(async (tx) => {
      //check if cart still valid.
      shoppingCart.shoppingCartDetails.forEach((item) => {
        const product = item.product;
        if (!product.enabled || product.deletedAt || product.quantity < item.quantity) {
          throw new BadRequestException('Shopping Cart is not valid.');
        }
      });

      const orderTotal = shoppingCart.shoppingCartDetails
        .map((item) => item.product.price.times(item.quantity))
        .reduce((prev, next) => prev.plus(next));

      const orderCreated = await tx.order.create({
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

      await tx.shoppingCart.update({
        where: {
          id: shoppingCart.id,
        },
        data: {
          status: ShoppingCartStatus.Completed,
          updatedAt: new Date(),
        },
      });

      await Promise.all(
        shoppingCart.shoppingCartDetails.map(async (item) => {
          const product = item.product;
          await tx.product.update({
            where: {
              id: product.id,
            },
            data: {
              quantity: product.quantity - item.quantity,
            },
          });
        }),
      );

      return orderCreated;
    });
  }
}
