import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';
import { v4 as uuid } from 'uuid';

@Injectable()
export class StorageService {
  constructor(private readonly configService: ConfigService) {}

  async uploadPublicFile(
    dataBuffer: Buffer,
    filename: string,
  ): Promise<{
    key: string;
    url: string;
  }> {
    const s3 = new S3();
    const uploadResult = await s3
      .upload({
        Bucket: this.configService.get('storage.bucketName'),
        Body: dataBuffer,
        Key: `${uuid()}-${filename}`,
      })
      .promise();

    return {
      key: uploadResult.Key,
      url: uploadResult.Location,
    };
  }

  async deletePublicFile(key: string) {
    const s3 = new S3();
    await s3
      .deleteObject({
        Bucket: this.configService.get('storage.bucketName'),
        Key: key,
      })
      .promise();
  }
}
