import { Injectable } from '@nestjs/common';
import { Category, Prisma, Product, ProductImage, ProductLike } from '@prisma/client';
import { StorageService } from 'src/integrations/services/storage.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';

export type ProductResponse = {
  [key: string]: any;
  categoryProducts: Category[];
};

@Injectable()
export class ProductsService {
  constructor(private readonly prismaService: PrismaService, private readonly storageService: StorageService) {}

  async findUnique(productWhereUniqueInput: Prisma.ProductWhereUniqueInput): Promise<Product | null> {
    return this.prismaService.product.findUnique({
      where: productWhereUniqueInput,
    });
  }

  async findMany(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.ProductWhereUniqueInput;
    where?: Prisma.ProductWhereInput;
    orderBy?: Prisma.ProductOrderByWithRelationInput;
  }): Promise<Product[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prismaService.product.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async create(input: CreateProductDto): Promise<ProductResponse> {
    const { categories, ...data } = input;

    const product = await this.prismaService.product.create({
      data: {
        ...data,
        categoryProducts: {
          create: categories.map(({ name }) => {
            return {
              category: {
                connectOrCreate: {
                  where: {
                    name,
                  },
                  create: {
                    name,
                  },
                },
              },
            };
          }),
        },
      },
      include: {
        categoryProducts: {
          include: {
            category: true,
          },
        },
      },
    });
    return {
      ...product,
      categoryProducts: product?.categoryProducts.map((item) => item.category),
    };
  }

  async update(id: string, data: UpdateProductDto): Promise<Product> {
    return this.prismaService.product.update({
      where: {
        id: id,
      },
      data,
    });
  }

  async delete(where: Prisma.ProductWhereUniqueInput): Promise<Product> {
    return this.prismaService.product.delete({
      where,
    });
  }

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
