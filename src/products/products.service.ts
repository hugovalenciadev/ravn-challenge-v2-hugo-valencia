import { Injectable, NotFoundException } from '@nestjs/common';
import { Category, Prisma, Product, ProductImage, ProductLike } from '@prisma/client';
import { throws } from 'assert';
import { StorageService } from 'src/integrations/services/storage.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddCategoriesToProductDto } from './dtos/categories/add-categories-to-product.dto';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';

export type ProductResponse = {
  [key: string]: any;
  categories: Category[];
  productImages?: ProductImage[];
};

@Injectable()
export class ProductsService {
  constructor(private readonly prismaService: PrismaService, private readonly storageService: StorageService) {}

  private async checkIfProductExist(productId: string): Promise<void> {
    const productInstance = await this.findFirst({
      id: productId,
      enabled: true,
      deletedAt: null,
    });

    if (!productInstance) {
      throw new NotFoundException('Not Found', { cause: new Error(), description: 'Product Not Found' });
    }
  }

  async findUnique(productWhereUniqueInput: Prisma.ProductWhereUniqueInput): Promise<Product | null> {
    return this.prismaService.product.findUnique({
      where: productWhereUniqueInput,
    });
  }

  async findFirst(where: Prisma.ProductWhereInput): Promise<Product | null> {
    return this.prismaService.product.findFirst({
      where,
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

  async addCategories(id: string, input: AddCategoriesToProductDto): Promise<ProductResponse> {
    await this.checkIfProductExist(id);

    const product = await this.prismaService.product.update({
      where: {
        id,
      },
      data: {
        categoryProducts: {
          create: input?.categories.map(({ name }) => {
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
      categories: product?.categoryProducts.map((item) => item.category),
    };
  }

  async findById(id: string): Promise<ProductResponse> {
    await this.checkIfProductExist(id);
    const product = await this.prismaService.product.findUniqueOrThrow({
      where: {
        id,
      },
      include: {
        categoryProducts: {
          include: {
            category: true,
          },
        },
        productImages: true,
      },
    });
    return {
      ...product,
      categories: product?.categoryProducts.map((item) => item.category),
    };
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
      categories: product?.categoryProducts.map((item) => item.category),
    };
  }

  async update(id: string, data: UpdateProductDto): Promise<Product> {
    await this.checkIfProductExist(id);
    return this.prismaService.product.update({
      where: {
        id: id,
      },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async enabled(id: string): Promise<Product> {
    const productInstance = await this.findFirst({
      id: id,
      deletedAt: null,
    });

    if (!productInstance) {
      throw new NotFoundException('Not Found', { cause: new Error(), description: 'Product Not Found' });
    }

    return this.prismaService.product.update({
      where: {
        id: id,
      },
      data: {
        enabled: true,
        updatedAt: new Date(),
      },
    });
  }

  async softDelete(id: string): Promise<Product> {
    await this.checkIfProductExist(id);
    return this.prismaService.product.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async like(userId: string, productId: string): Promise<ProductLike> {
    await this.checkIfProductExist(productId);
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
    await this.checkIfProductExist(productId);
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
    await this.checkIfProductExist(productId);
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
