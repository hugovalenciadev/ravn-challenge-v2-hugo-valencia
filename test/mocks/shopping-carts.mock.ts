import { faker } from '@faker-js/faker';
import { Prisma, Product, ShoppingCart, User } from '@prisma/client';
import ShoppingCartStatus from '../../src/shopping-carts/enums/shopping-cart-status.enum';

const { datatype } = faker;

export const shoppingCartWithPendingStatusMock: ShoppingCart = {
  id: datatype.uuid(),
  userId: datatype.uuid(),
  enabled: true,
  status: ShoppingCartStatus.Pending,
  createdAt: datatype.datetime(),
  updatedAt: datatype.datetime(),
};

export const userMock: User = {
  id: datatype.uuid(),
  email: 'test@gmail.com',
  firstName: datatype.string(),
  lastName: datatype.string(),
  password: datatype.string(),
  createdAt: datatype.datetime(),
  updatedAt: datatype.datetime(),
  enabled: true,
};

export const productMock: Product = {
  id: datatype.uuid(),
  name: datatype.string(),
  description: datatype.string(),
  enabled: datatype.boolean(),
  quantity: datatype.number(),
  price: datatype.float() as unknown as Prisma.Decimal,
  createdAt: datatype.datetime(),
  updatedAt: datatype.datetime(),
  deletedAt: null,
};
