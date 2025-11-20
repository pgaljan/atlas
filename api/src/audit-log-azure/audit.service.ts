import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
} from '@azure/storage-blob';
import { DefaultAzureCredential } from '@azure/identity';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);
  private blobServiceClient: BlobServiceClient;
  private readonly containerName: string;
  private readonly blobPrefix: string;

  constructor(private readonly prisma: PrismaService) {
    this.containerName = process.env.AZURE_STORAGE_CONTAINER || 'audit-logs';
    this.blobPrefix = process.env.AZURE_AUDIT_BLOB_PREFIX || 'audit';

    const conn = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;

    if (conn) {
      this.blobServiceClient = BlobServiceClient.fromConnectionString(conn);
      this.logger.log('AuditService: Using Connection String');
      return;
    }

    if (accountName) {
      try {
        const credential = new DefaultAzureCredential();

        const testClient = new BlobServiceClient(
          `https://${accountName}.blob.core.windows.net`,
          credential,
        );

        this.logger.log(
          'AuditService: Using DefaultAzureCredential (Azure AD)',
        );
        this.blobServiceClient = testClient;
        return;
      } catch (adErr) {
        this.logger.warn(
          'AuditService: Azure AD Authentication failed, falling back to Shared Key',
          adErr as any,
        );
      }
    }

    if (accountName && accountKey) {
      const sharedKeyCred = new StorageSharedKeyCredential(
        accountName,
        accountKey,
      );

      this.blobServiceClient = new BlobServiceClient(
        `https://${accountName}.blob.core.windows.net`,
        sharedKeyCred,
      );

      this.logger.log('AuditService: Using Shared Key Fallback');
      return;
    }

    throw new Error(
      'Azure Storage not configured: provide either AZURE_STORAGE_CONNECTION_STRING or (AZURE_STORAGE_ACCOUNT_NAME + AZURE_STORAGE_ACCOUNT_KEY)',
    );
  }

  private normalizedPrefix(): string {
    return this.blobPrefix.replace(/\/+$/, '');
  }

  async checkIfAuditAlreadyUploaded(auditId: string): Promise<boolean> {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(
        this.containerName,
      );

      const datePrefix = new Date().toISOString().slice(0, 10);
      const prefix = this.normalizedPrefix();
      const blobName = `${prefix}/${datePrefix}/audit-${auditId}.json`;

      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      return await blockBlobClient.exists();
    } catch (err) {
      this.logger.warn('Azure checkIfAuditAlreadyUploaded failed:', err);
      return false;
    }
  }

  async uploadAuditRow(auditRow: {
    id: string;
    createdAt: Date;
    action: string;
    element?: string;
    elementId?: string | null;
    userId?: string | null;
    details?: any;
  }) {
    try {
      let usernameToUse = '';
      let emailToUse = '';

      if (auditRow.userId) {
        try {
          const user = await this.prisma.user.findUnique({
            where: { id: auditRow.userId },
            select: { username: true, email: true },
          });
          if (user) {
            usernameToUse = user.username ?? '';
            emailToUse = user.email ?? '';
          }
        } catch (err) {
          this.logger.warn('Failed to fetch user for uploadAuditRow', err);
        }
      }

      const containerClient = this.blobServiceClient.getContainerClient(
        this.containerName,
      );
      await containerClient.createIfNotExists();

      const date = new Date(auditRow.createdAt).toISOString().slice(0, 10);
      const prefix = this.normalizedPrefix();
      const blobName = `${prefix}/${date}/audit-${auditRow.id}.json`;

      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      const payload = {
        id: auditRow.id,
        action: auditRow.action,
        element: auditRow.element,
        elementId: auditRow.elementId,
        createdAt: auditRow.createdAt,
        userId: auditRow.userId ?? null,
        username: usernameToUse,
        email: emailToUse,
        details: auditRow.details ?? {},
      };

      const json = JSON.stringify(payload, null, 2);
      await blockBlobClient.upload(json, Buffer.byteLength(json));

      this.logger.log(`Audit uploaded: ${blobName}`);
    } catch (err) {
      this.logger.error('Failed to upload audit log to Azure', err);
    }
  }

  async logAndUpload(options: {
    action: string;
    element?: string;
    elementId?: string | null;
    details?: any;
    userId?: string | null;
    username?: string | null;
    email?: string | null;
    searchWindowMs?: number;
  }) {
    const {
      action,
      element,
      elementId,
      details,
      userId,
      username,
      email,
      searchWindowMs = 15000,
    } = options;

    const actionNorm = (action || '').toUpperCase();
    const elementNorm = element ? element.toString() : null;
    const cutoff = new Date(Date.now() - searchWindowMs);

    let auditRow = await this.prisma.auditLog.findFirst({
      where: {
        action: actionNorm,
        element: elementNorm,
        elementId: elementId ?? null,
        userId: userId ?? null,
        createdAt: { gte: cutoff },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!auditRow) {
      auditRow = await this.prisma.auditLog.create({
        data: {
          action: actionNorm,
          element: elementNorm ?? null,
          elementId: elementId ?? null,
          details: details ?? {},
          userId: userId ?? null,
        },
      });
    }

    let usernameToUse = username ?? '';
    let emailToUse = email ?? '';

    try {
      if ((!usernameToUse || !emailToUse) && auditRow.userId) {
        const u = await this.prisma.user.findUnique({
          where: { id: auditRow.userId },
          select: { username: true, email: true },
        });
        if (u) {
          usernameToUse ||= u.username ?? '';
          emailToUse ||= u.email ?? '';
        }
      }
    } catch (err) {
      this.logger.warn('Failed to fetch user for audit username/email', err);
    }

    try {
      const containerClient = this.blobServiceClient.getContainerClient(
        this.containerName,
      );
      await containerClient.createIfNotExists();

      const date = new Date(auditRow.createdAt).toISOString().slice(0, 10);
      const prefix = this.normalizedPrefix();
      const blobName = `${prefix}/${date}/audit-${auditRow.id}.json`;

      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      const payload = {
        id: auditRow.id,
        action: auditRow.action,
        element: auditRow.element,
        elementId: auditRow.elementId,
        createdAt: auditRow.createdAt,
        userId: auditRow.userId ?? null,
        username: usernameToUse,
        email: emailToUse,
        details: auditRow.details ?? {},
      };

      const json = JSON.stringify(payload, null, 2);
      await blockBlobClient.upload(json, Buffer.byteLength(json));

      this.logger.log(`Audit uploaded: ${blobName}`);
    } catch (err) {
      this.logger.error('Failed to upload audit log to Azure', err);
    }

    return auditRow;
  }
}
