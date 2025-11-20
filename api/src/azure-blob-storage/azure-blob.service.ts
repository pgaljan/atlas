import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import {
  BlobServiceClient,
  ContainerClient,
  BlobSASPermissions,
  generateBlobSASQueryParameters,
  SASProtocol,
  StorageSharedKeyCredential,
  BlockBlobClient,
  UserDelegationKey,
  BlobSASSignatureValues,
} from '@azure/storage-blob';
import { DefaultAzureCredential } from '@azure/identity';
import { Readable } from 'stream';

@Injectable()
export class AzureBlobService {
  private readonly logger = new Logger(AzureBlobService.name);

  private blobServiceClient?: BlobServiceClient;
  private containerClient?: ContainerClient;
  private readonly containerName: string;
  private readonly accountName?: string;
  private readonly accountKey?: string;
  private readonly connectionString?: string;

  constructor() {
    this.containerName =
      process.env.AZURE_STORAGE_CONTAINER || 'corpus-reviews';
    this.accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    this.accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
    this.connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

    try {
      this.initializeClient();
    } catch (err) {
      this.logger.error('Azure Blob Service initialization failed', err as any);
      throw new InternalServerErrorException(
        'Azure Blob initialization failed',
      );
    }
  }

  private initializeClient(): void {
    if (this.connectionString) {
      this.logger.log('Using Azure connection string authentication');
      this.blobServiceClient = BlobServiceClient.fromConnectionString(
        this.connectionString,
      );
    } else if (this.accountName) {
      try {
        this.logger.log(
          'Attempting Azure AD authentication via DefaultAzureCredential',
        );
        const credential = new DefaultAzureCredential();
        this.blobServiceClient = new BlobServiceClient(
          `https://${this.accountName}.blob.core.windows.net`,
          credential,
        );
      } catch (adErr) {
        this.logger.warn(
          'Azure AD authentication setup failed — will try shared key if available',
          adErr as any,
        );
      }

      if (!this.blobServiceClient) {
        if (!this.accountKey) {
          this.logger.warn(
            'No valid Azure auth found (no connection string, no account key, AD client failed). Service will be disabled.',
          );
          return;
        }
        this.logger.log(
          'Falling back to StorageSharedKeyCredential (account key)',
        );
        const sharedKeyCred = new StorageSharedKeyCredential(
          this.accountName,
          this.accountKey,
        );
        this.blobServiceClient = new BlobServiceClient(
          `https://${this.accountName}.blob.core.windows.net`,
          sharedKeyCred,
        );
      }
    } else {
      this.logger.warn(
        'Azure storage account name not provided — service disabled (set AZURE_STORAGE_ACCOUNT_NAME or AZURE_STORAGE_CONNECTION_STRING)',
      );
      return;
    }

    this.containerClient = this.blobServiceClient.getContainerClient(
      this.containerName,
    );
    this.containerClient
      .createIfNotExists()
      .then(() => this.logger.log(`Container ensured: ${this.containerName}`))
      .catch((err) =>
        this.logger.error(
          `Failed to ensure container ${this.containerName}`,
          err,
        ),
      );
  }

  private ensureInitialized(): {
    blobServiceClient: BlobServiceClient;
    containerClient: ContainerClient;
  } {
    if (!this.blobServiceClient || !this.containerClient) {
      throw new InternalServerErrorException(
        'Azure Blob service not configured',
      );
    }
    return {
      blobServiceClient: this.blobServiceClient,
      containerClient: this.containerClient,
    };
  }

  async uploadBuffer(
    file: Buffer | Readable,
    blobName: string,
    contentType?: string,
    expiresInMinutes = 60,
  ): Promise<{ url: string; blobName: string; container: string }> {
    const { containerClient } = this.ensureInitialized();
    const blobClient = containerClient.getBlockBlobClient(blobName);

    try {
      if (Buffer.isBuffer(file)) {
        await blobClient.uploadData(file, {
          blobHTTPHeaders: {
            blobContentType: contentType || 'application/octet-stream',
          },
        });
        this.logger.log(`Uploaded blob (buffer): ${blobName}`);
      } else if (file instanceof Readable) {
        const blockSize = 8 * 1024 * 1024; // 8MB
        const concurrency = 5;
        await blobClient.uploadStream(file, blockSize, concurrency, {
          blobHTTPHeaders: {
            blobContentType: contentType || 'application/octet-stream',
          },
        });
        this.logger.log(`Uploaded blob (stream): ${blobName}`);
      } else {
        throw new InternalServerErrorException('Unsupported file input type');
      }

      const sasUrl = await this.generateSasUrl(blobName, 'r', expiresInMinutes);
      return { url: sasUrl, blobName, container: this.containerName };
    } catch (err) {
      this.logger.error(`Upload failed for blob ${blobName}`, err as any);
      throw new InternalServerErrorException('Failed to upload blob');
    }
  }

  async deleteBlob(blobName: string): Promise<void> {
    const { containerClient } = this.ensureInitialized();
    try {
      const blobClient = containerClient.getBlockBlobClient(blobName);
      const result = await blobClient.deleteIfExists();
      if (result.succeeded) {
        this.logger.log(`Blob deleted: ${blobName}`);
      } else {
        this.logger.warn(`Blob not found or already deleted: ${blobName}`);
      }
    } catch (err) {
      this.logger.error(`Delete failed for blob ${blobName}`, err as any);
      throw new InternalServerErrorException('Failed to delete blob');
    }
  }

  async generateDownloadSas(
    blobName: string,
    expiresInMinutes = 60,
  ): Promise<string> {
    this.ensureInitialized();
    return this.generateSasUrl(blobName, 'r', expiresInMinutes);
  }

  private async generateSasUrl(
    blobName: string,
    permissionsString: string,
    expiresInMinutes: number,
  ): Promise<string> {
    const { blobServiceClient, containerClient } = this.ensureInitialized();
    const blobClient = containerClient.getBlockBlobClient(blobName);

    const startsOn = new Date();
    const expiresOn = new Date(
      startsOn.getTime() + expiresInMinutes * 60 * 1000,
    );
    const permissions = BlobSASPermissions.parse(permissionsString);

    try {
      if (!this.accountName) {
        throw new Error('accountName is required for SAS generation');
      }
      // Request user delegation key
      const userDelegationKey: UserDelegationKey =
        await blobServiceClient.getUserDelegationKey(startsOn, expiresOn);
      this.logger.log('Obtained User Delegation Key for SAS');

      const sasOptions: BlobSASSignatureValues = {
        containerName: this.containerName,
        blobName,
        permissions,
        startsOn,
        expiresOn,
        protocol: SASProtocol.Https,
        version: '2024-08-01', // adjust to current storage version if needed
      };

      const sasToken = generateBlobSASQueryParameters(
        sasOptions,
        userDelegationKey,
        this.accountName,
      ).toString();
      this.logger.log('Generated User Delegation SAS token');
      return `${blobClient.url}?${sasToken}`;
    } catch (udErr) {
      this.logger.warn(
        'User Delegation SAS generation failed or not permitted. Falling back to Shared Key SAS.',
        udErr as any,
      );
    }

    // Fallback to Shared Key SAS
    if (!this.accountName || !this.accountKey) {
      this.logger.error(
        'SAS generation failed: Missing accountName or accountKey for fallback',
      );
      throw new InternalServerErrorException(
        'SAS generation failed: missing credentials',
      );
    }
    const sharedKeyCred = new StorageSharedKeyCredential(
      this.accountName,
      this.accountKey,
    );
    const fallbackSasToken = generateBlobSASQueryParameters(
      {
        containerName: this.containerName,
        blobName,
        permissions,
        startsOn,
        expiresOn,
        protocol: SASProtocol.Https,
      },
      sharedKeyCred,
    ).toString();
    this.logger.log('Generated Shared Key SAS token (fallback)');
    return `${blobClient.url}?${fallbackSasToken}`;
  }
}
