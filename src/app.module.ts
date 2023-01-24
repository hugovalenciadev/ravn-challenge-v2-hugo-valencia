import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import appConfig from './config/app.config';
import storageConfig from './config/storage.config';
import { appValidationSchema } from './config/validators/app.validator';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { ShoppingCartsModule } from './shopping-carts/shopping-carts.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig, storageConfig],
      isGlobal: true,
      cache: true,
      expandVariables: true,
      validationSchema: appValidationSchema,
    }),
    PrismaModule,
    UsersModule,
    ProductsModule,
    ShoppingCartsModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
