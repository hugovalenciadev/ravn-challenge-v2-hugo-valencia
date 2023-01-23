import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config';
import { appValidationSchema } from './config/validators/app.validator';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig],
      isGlobal: true,
      cache: true,
      expandVariables: true,
      validationSchema: appValidationSchema,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
