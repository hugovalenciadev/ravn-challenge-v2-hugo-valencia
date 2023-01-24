import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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

export type ShoppingCartWithDetails = Prisma.ShoppingCartGetPayload<{
  include: {
    shoppingCartDetails: {
      include: {
        product: true;
      };
    };
  };
}>;

@Injectable()
export class ShoppingCartsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly usersService: UsersService,
    private readonly productsService: ProductsService,
  ) {}

  private async checkProductStock(productId: string, quantity: number): Promise<void> {
    const productDb = await this.productsService.findFirst({
      id: productId,
      deletedAt: null,
      enabled: true,
      quantity: {
        gte: quantity,
      },
    });

    if (!productDb) {
      throw new BadRequestException('Bad Request', { cause: new Error(), description: 'Product not valid' });
    }
  }
  private async checkUserAndProduct(userId: string, productId: string): Promise<void> {
    const userInstance = await this.usersService.findFirst({
      id: userId,
    });

    if (!userInstance) {
      throw new NotFoundException('Not Found', { cause: new Error(), description: 'User Not Found.' });
    }

    const productInstance = await this.productsService.findFirst({
      id: productId,
      enabled: true,
      deletedAt: null,
    });

    if (!productInstance) {
      throw new NotFoundException('Not Found', { cause: new Error(), description: 'Product Not Found' });
    }
  }

  private async findOrCreateShoppingCartStatusPending(
    userId: string,
    tx: Prisma.TransactionClient,
  ): Promise<ShoppingCartWithDetails> {
    let shoppingCartInstance = await tx.shoppingCart.findFirst({
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
      },
    });

    if (!shoppingCartInstance) {
      shoppingCartInstance = await tx.shoppingCart.create({
        data: {
          userId: userId,
          status: ShoppingCartStatus.Pending,
        },
        include: {
          shoppingCartDetails: {
            include: {
              product: true,
            },
          },
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

  async add(userId: string, productId: string): Promise<ShoppingCartWithDetails> {
    await this.checkUserAndProduct(userId, productId);
    await this.checkProductStock(productId, 1);
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

      return await this.findOrCreateShoppingCartStatusPending(userId, tx);
    });
  }

  async update(
    userId: string,
    productId: string,
    updateShoppingCartDto: UpdateShoppingCartDto,
  ): Promise<ShoppingCartWithDetails> {
    await this.checkUserAndProduct(userId, productId);
    await this.checkProductStock(productId, updateShoppingCartDto.quantity);
    return await this.prismaService.$transaction(async (tx) => {
      const shoppingCartInstance = await this.findOrCreateShoppingCartStatusPending(userId, tx);

      await tx.shoppingCartDetail.update({
        where: {
          shoppingCartId_productId: {
            productId: productId,
            shoppingCartId: shoppingCartInstance.id,
          },
        },
        data: {
          productId: productId,
          quantity: updateShoppingCartDto.quantity,
          shoppingCartId: shoppingCartInstance.id,
        },
      });

      return await this.findOrCreateShoppingCartStatusPending(userId, tx);
    });
  }

  async delete(userId: string, productId: string): Promise<ShoppingCartWithDetails> {
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

      return await this.findOrCreateShoppingCartStatusPending(userId, tx);
    });
  }
}
