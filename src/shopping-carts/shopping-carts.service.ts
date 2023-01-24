import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, ShoppingCart } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductsService } from 'src/products/products.service';
import { UsersService } from 'src/users/users.service';
import { UpdateShoppingCartDto } from './dtos/update-shopping-cart.dto';
import ShoppingCartStatus from './enums/shopping-cart-status.enum';

export type ShoppingCartWithUserAndDetails = Prisma.ShoppingCartGetPayload<{
  include: {
    shoppingCartDetails: {
      include: {
        product: true;
      };
    };
    user: true;
  };
}>;

@Injectable()
export class ShoppingCartsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly usersService: UsersService,
    private readonly productsService: ProductsService,
  ) {}

  private async checkUserAndProduct(userId: string, productId: string): Promise<void> {
    const userInstance = await this.usersService.findFirst({
      id: userId,
    });

    if (userInstance) {
      throw new BadRequestException('Bad Request', { cause: new Error(), description: 'User not exists.' });
    }

    const productInstance = await this.productsService.findUnique({
      id: productId,
    });

    if (productInstance) {
      throw new BadRequestException('Bad Request', { cause: new Error(), description: 'Product not exists.' });
    }
  }

  private async findOrCreateShoppingCartStatusPending(
    userId: string,
    tx: Prisma.TransactionClient,
  ): Promise<ShoppingCart> {
    let shoppingCartInstance = await tx.shoppingCart.findFirst({
      where: {
        userId: userId,
        status: ShoppingCartStatus.Pending,
        enabled: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!shoppingCartInstance) {
      shoppingCartInstance = await tx.shoppingCart.create({
        data: {
          userId: userId,
          status: ShoppingCartStatus.Pending,
        },
      });
    }
    return shoppingCartInstance;
  }

  async findFirstPendingByUser(userId: string): Promise<ShoppingCartWithUserAndDetails | null> {
    return await this.prismaService.shoppingCart.findFirst({
      where: {
        userId: userId,
        status: ShoppingCartStatus.Pending,
        enabled: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        shoppingCartDetails: {
          include: {
            product: true,
          },
        },
        user: true,
      },
    });
  }

  async add(userId: string, productId: string): Promise<ShoppingCart> {
    await this.checkUserAndProduct(userId, productId);

    return await this.prismaService.$transaction(async (tx) => {
      const shoppingCartInstance = await this.findOrCreateShoppingCartStatusPending(userId, tx);

      await tx.shoppingCartDetail.upsert({
        where: {
          shoppingCartId_productId: {
            productId: productId,
            shoppingCartId: shoppingCartInstance.id,
          },
        },
        create: {
          productId: productId,
          quantity: 1,
          shoppingCartId: shoppingCartInstance.id,
        },
        update: {},
      });

      return shoppingCartInstance;
    });
  }

  async update(userId: string, productId: string, updateShoppingCartDto: UpdateShoppingCartDto): Promise<ShoppingCart> {
    await this.checkUserAndProduct(userId, productId);

    return await this.prismaService.$transaction(async (tx) => {
      const shoppingCartInstance = await this.findOrCreateShoppingCartStatusPending(userId, tx);

      await tx.shoppingCartDetail.upsert({
        where: {
          shoppingCartId_productId: {
            productId: productId,
            shoppingCartId: shoppingCartInstance.id,
          },
        },
        create: {
          productId: productId,
          quantity: 1,
          shoppingCartId: shoppingCartInstance.id,
        },
        update: {
          productId: productId,
          quantity: updateShoppingCartDto.quantity,
          shoppingCartId: shoppingCartInstance.id,
        },
      });

      return shoppingCartInstance;
    });
  }

  async delete(userId: string, productId: string): Promise<ShoppingCart> {
    await this.checkUserAndProduct(userId, productId);

    return await this.prismaService.$transaction(async (tx) => {
      const shoppingCartInstance = await this.findOrCreateShoppingCartStatusPending(userId, tx);

      await tx.shoppingCartDetail.delete({
        where: {
          shoppingCartId_productId: {
            productId: productId,
            shoppingCartId: shoppingCartInstance.id,
          },
        },
      });

      return shoppingCartInstance;
    });
  }
}
