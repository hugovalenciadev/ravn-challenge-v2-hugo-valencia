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
  // jwt
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().required(),
  // s3
  AWS_REGION: Joi.string().required(),
  AWS_ACCESS_KEY_ID: Joi.string().required(),
  AWS_SECRET_ACCESS_KEY: Joi.string().required(),
  AWS_BUCKET_NAME: Joi.string().required(),
});
