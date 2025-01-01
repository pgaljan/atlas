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
    elementId: number | string,
    details: object,
    userId?: number,
  ) {
    await this.prisma.auditLog.create({
      data: {
        action,
        element,
        elementId: elementId.toString(),
        details: details,
        userId: userId || null,
      },
    });
  }

  async createRecord(elementId: number, createRecordDto: CreateRecordDto) {
    const element = await this.prisma.element.findUnique({
      where: { id: elementId },
    });
    if (!element) throw new NotFoundException('Element not found');

    try {
      const newRecord = await this.prisma.record.create({
        data: {
          ...createRecordDto,
          tags: createRecordDto.tags ?? null,
          Element: { connect: { id: elementId } },
        },
      });

      // Log the audit for create action
      await this.logAudit('CREATE', 'Record', newRecord.id, {
        data: createRecordDto,
      });

      return newRecord;
    } catch (error) {
      throw new BadRequestException('Error creating record');
    }
  }

  async updateRecord(recordId: number, updateRecordDto: UpdateRecordDto) {
    const record = await this.prisma.record.findUnique({
      where: { id: recordId },
    });
    if (!record) throw new NotFoundException('Record not found');

    try {
      const updatedRecord = await this.prisma.record.update({
        where: { id: recordId },
        data: {
          ...updateRecordDto,
        },
      });

      // Log the audit for update action
      await this.logAudit('UPDATE', 'Record', updatedRecord.id, {
        updatedFields: updateRecordDto,
      });

      return updatedRecord;
    } catch (error) {
      throw new BadRequestException('Error updating record');
    }
  }

  async getRecordById(recordId: number) {
    if (!recordId || isNaN(recordId)) {
      throw new BadRequestException('Invalid record ID');
    }

    const record = await this.prisma.record.findUnique({
      where: { id: recordId },
      include: { Element: true },
    });

    if (!record) {
      throw new NotFoundException('Record not found');
    }

    return record;
  }

  async getAllRecords(elementId: number) {
    if (isNaN(elementId)) {
      throw new BadRequestException('Invalid element ID');
    }

    return this.prisma.record.findMany({
      where: { Element: { some: { id: elementId } } },
      include: { Element: true },
    });
  }

  async deleteRecord(recordId: number) {
    const record = await this.prisma.record.findUnique({
      where: { id: recordId },
    });

    if (!record) {
      throw new NotFoundException('Record not found');
    }

    try {
      const deletedRecord = await this.prisma.record.delete({
        where: { id: recordId },
      });

      // Log the audit for delete action
      await this.logAudit('DELETE', 'Record', deletedRecord.id, {
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
