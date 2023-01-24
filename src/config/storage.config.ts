import { registerAs } from '@nestjs/config';
import { IStorageConfig } from './interfaces/storage.interface';

export default registerAs(
  'storage',
  (): IStorageConfig => ({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    bucketName: process.env.AWS_BUCKET_NAME,
  }),
);
