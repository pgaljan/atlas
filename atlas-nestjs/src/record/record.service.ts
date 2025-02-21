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

  async createRecord(elementid: string, createRecordDto: CreateRecordDto) {
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
          Element: { connect: { id: elementid } },
        },
      });

      // Log the audit for create action
      await this.logAudit('CREATE', 'Record', newRecord.id.toString(), {
        data: createRecordDto,
      });

      return newRecord;
    } catch (error) {
      throw new BadRequestException('Error creating record');
    }
  }

  async updateRecord(recordid: string, updateRecordDto: UpdateRecordDto) {
    const record = await this.prisma.record.findUnique({
      where: { id: recordid },
    });
    if (!record) throw new NotFoundException('Record not found');

    try {
      const updatedRecord = await this.prisma.record.update({
        where: { id: recordid },
        data: {
          ...updateRecordDto,
          metadata: updateRecordDto.metadata,
        },
      });

      // Log the audit for update action
      await this.logAudit('UPDATE', 'Record', updatedRecord.id.toString(), {
        updatedFields: updateRecordDto,
      });

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

  async deleteRecord(recordid: string) {
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
      await this.logAudit('DELETE', 'Record', deletedRecord.id.toString(), {
        deletedRecord,
      });

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
