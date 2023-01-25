import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { configServiceMock } from '../../test/mocks/config-service.mock';
import { PartialMock } from '../../test/mocks/partial.mock';
import { productMock, shoppingCartWithPendingStatusMock, userMock } from '../../test/mocks/shopping-carts.mock';
import { storageMockService } from '../../test/mocks/storage-service.mock';
import { StorageService } from '../integrations/services/storage.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from '../products/products.service';
import { UsersService } from '../users/users.service';
import { ShoppingCartsService } from './shopping-carts.service';

describe('ShoppingCartsService', () => {
  let service: ShoppingCartsService;
  let prismaService: PrismaService;
  let productsService: ProductsService;
  let usersService: UsersService;
  let storageService: PartialMock<StorageService>;
  let configService: ConfigService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShoppingCartsService,
        PrismaService,
        ProductsService,
        UsersService,
        { provide: StorageService, useFactory: storageMockService },
        { provide: ConfigService, useFactory: configServiceMock },
      ],
    }).compile();

    service = module.get<ShoppingCartsService>(ShoppingCartsService);
    prismaService = module.get(PrismaService);
    productsService = module.get<ProductsService>(ProductsService);
    usersService = module.get<UsersService>(UsersService);
    storageService = module.get(StorageService);
    configService = module.get(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await prismaService.$disconnect();
  });

  describe('.delete', () => {
    it('should delete product from a shopping cart', async () => {
      jest.spyOn(prismaService['user'], 'findFirst').mockResolvedValueOnce(userMock);

      jest.spyOn(prismaService['product'], 'findFirst').mockResolvedValueOnce(productMock);

      jest.spyOn(prismaService['shoppingCart'], 'findFirst').mockResolvedValue(shoppingCartWithPendingStatusMock);

      jest.spyOn(prismaService['shoppingCartDetail'], 'delete').mockResolvedValueOnce({
        productId: productMock.id,
        shoppingCartId: shoppingCartWithPendingStatusMock.id,
        id: '',
        quantity: 0,
      });

      const result = await service.delete(userMock.id, productMock.id);
      expect(result).toEqual(shoppingCartWithPendingStatusMock);
    });
  });
});
