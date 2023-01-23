import * as Joi from 'joi';
import { AppEnvironment } from '../enums/app-environment.enum';

export const appValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid(AppEnvironment.DEV, AppEnvironment.TEST, AppEnvironment.STAGING, AppEnvironment.PRODUCTION)
    .default(AppEnvironment.DEV),
  APP_ENV: Joi.string()
    .valid(AppEnvironment.DEV, AppEnvironment.TEST, AppEnvironment.STAGING, AppEnvironment.PRODUCTION)
    .default(AppEnvironment.DEV),
  PORT: Joi.number().default(3000),
  // prisma
  DATABASE_URL: Joi.string().required(),
});
