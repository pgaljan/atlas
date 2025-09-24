import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';

@Injectable()
export class RecordService {
  constructor(private readonly prisma: PrismaService) {}

  // Log audit action method
  private async logAudit(
    action: string,
    element: string,
    elementid: string,
    details: object,
    userId?: string,
  ) {
    await this.prisma.auditLog.create({
      data: {
        action,
        element,
        elementId: elementid,
        details: details,
        userId: userId || null,
      },
    });
  }

  async createRecord(
    elementid: string,
    createRecordDto: CreateRecordDto,
    userId: string,
  ) {
    const element = await this.prisma.element.findUnique({
      where: { id: elementid },
    });

    if (!element) throw new NotFoundException('Element not found');

    try {
      const newRecord = await this.prisma.record.create({
        data: {
          ...createRecordDto,
          metadata: createRecordDto.metadata,
          tags: createRecordDto.tags ?? null,
          recordSvg: createRecordDto.recordSvg ?? null,
          Element: { connect: { id: elementid } },
          editorType: createRecordDto.editorType ?? undefined,
          renderer: createRecordDto.renderer ?? undefined,
        },
      });

      // Log the audit for create action
      await this.logAudit(
        'CREATE',
        'Record',
        newRecord.id.toString(),
        { data: createRecordDto },
        userId,
      );

      return newRecord;
    } catch (error) {
      throw new BadRequestException('Error creating record');
    }
  }

  async updateRecord(
    recordId: string,
    updateRecordDto: UpdateRecordDto,
    userId?: string,
  ) {
    const existingRecord = await this.prisma.record.findUnique({
      where: { id: recordId },
    });

    if (!existingRecord) {
      throw new NotFoundException('Record not found');
    }

    const { metadata, tags, editorType, renderer, recordSvg } = updateRecordDto;

    const updateData: any = {};

    if (metadata !== undefined) {
      updateData.metadata = metadata;
    }

    if (tags !== undefined) {
      updateData.tags = tags;
    }

    if (editorType !== undefined) {
      updateData.editorType = editorType;
    }

    if (renderer !== undefined) {
      updateData.renderer = renderer;
    }

    if (recordSvg !== undefined) updateData.recordSvg = recordSvg;

    try {
      const updatedRecord = await this.prisma.record.update({
        where: { id: recordId },
        data: updateData,
      });

      await this.logAudit(
        'UPDATE',
        'Record',
        updatedRecord.id.toString(),
        {
          before: {
            metadata: existingRecord.metadata,
            tags: existingRecord.tags,
            editorType: existingRecord.editorType,
            renderer: existingRecord.renderer,
          },
          after: updateData,
        },
        userId || null,
      );

      return updatedRecord;
    } catch (error) {
      throw new BadRequestException('Error updating record');
    }
  }

  async getRecordById(recordid: string) {
    if (!recordid) {
      throw new BadRequestException('Invalid record ID');
    }

    const record = await this.prisma.record.findUnique({
      where: { id: recordid },
      include: { Element: true },
    });

    if (!record) {
      throw new NotFoundException('Record not found');
    }

    return record;
  }

  async getAllRecords(elementid: string) {
    if (!elementid) {
      throw new BadRequestException('Invalid element ID');
    }

    return this.prisma.record.findMany({
      where: { Element: { some: { id: elementid } } },
      include: { Element: true },
    });
  }

  async deleteRecord(recordid: string, userId?: string) {
    const record = await this.prisma.record.findUnique({
      where: { id: recordid },
    });

    if (!record) {
      throw new NotFoundException('Record not found');
    }

    try {
      const deletedRecord = await this.prisma.record.delete({
        where: { id: recordid },
      });

      // Log the audit for delete action
      await this.logAudit(
        'DELETE',
        'Record',
        deletedRecord.id.toString(),
        {
          deletedRecord,
        },
        userId,
      );

      return deletedRecord;
    } catch (error) {
      throw new BadRequestException('Error deleting record');
    }
  }

  async getRecordsByTags(tags: { [key: string]: string }) {
    if (!tags || Object.keys(tags).length === 0) {
      throw new BadRequestException('Tags parameter is required');
    }

    return this.prisma.record.findMany({
      where: {
        tags: {
          equals: tags,
        },
      },
      include: { Element: true },
    });
  }
}
