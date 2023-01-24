import { Injectable } from '@nestjs/common';
import { ProductLike } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prismaService: PrismaService) {}

  async like(userId: string, productId: string): Promise<ProductLike> {
    return this.prismaService.productLike.upsert({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      update: {},
      create: {
        product: {
          connect: {
            id: productId,
          },
        },
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }

  async dislike(userId: string, productId: string): Promise<ProductLike> {
    return this.prismaService.productLike.delete({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });
  }
}
