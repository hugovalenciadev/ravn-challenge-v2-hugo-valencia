import { StorageService } from '../../src/integrations/services/storage.service';
import { PartialMock } from './partial.mock';

export const storageMockService = (): PartialMock<StorageService> => ({
  uploadPublicFile: jest.fn(),
  deletePublicFile: jest.fn(),
});
