import { ConfigService } from '@nestjs/config';
import { PartialMock } from './partial.mock';

export const configServiceMock = (): PartialMock<ConfigService> => ({
  get: jest.fn((key: string) => {
    const config = {
      'app.port': 3000,
      'storage.region': 'us-east-1',
      'storage.accessKeyId': '',
      'storage.secretAccessKey': '',
      'storage.bucketName': '',
    };

    return config[key];
  }),
});
