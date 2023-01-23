import { registerAs } from '@nestjs/config';
import { AppEnvironment } from './enums/app-environment.enum';
import { IAppConfig } from './interfaces/app-config.interface';

export default registerAs(
  'app',
  (): IAppConfig => ({
    appEnv: process.env.APP_ENV || AppEnvironment.DEV,
    port: parseInt(process.env.PORT, 10) || 3000,
    jwtSecret: process.env.JWT_SECRET,
  }),
);
