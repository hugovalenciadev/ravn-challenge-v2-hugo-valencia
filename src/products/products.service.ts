import { Injectable } from '@nestjs/common';
import { ProductImage, ProductLike } from '@prisma/client';
import { StorageService } from 'src/integrations/services/storage.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prismaService: PrismaService, private readonly storageService: StorageService) {}

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

  async addProductImage(productId: string, imageBuffer: Buffer, filename: string): Promise<ProductImage> {
    const product = await this.prismaService.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) {
      throw new Error('Product does not exist');
    }

    const { key, url } = await this.storageService.uploadPublicFile(imageBuffer, filename);

    return this.prismaService.productImage.create({
      data: {
        url,
        key,
        product: {
          connect: {
            id: productId,
          },
        },
      },
    });
  }

  async deleteProductImage(productImageId: string): Promise<void> {
    const { key } = await this.prismaService.productImage.findUnique({
      where: {
        id: productImageId,
      },
    });

    if (!key) {
      throw new Error('ProductImage not found');
    }

    await this.storageService.deletePublicFile(key);
  }
}
