import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { RecordService } from './record.service';

@Controller('records')
export class RecordController {
  constructor(private readonly recordService: RecordService) {}

  @Post('create')
  async create(
    @Query('elementId') elementId: string,
    @Body() createRecordDto: CreateRecordDto,
  ) {
    if (!elementId) {
      throw new BadRequestException('Invalid element ID');
    }

    await this.recordService.createRecord(elementId, createRecordDto);
    return { message: 'Record created successfully' };
  }

  @Get('record/:recordId')
  async findOne(@Param('recordId') recordId: string) {
    if (!recordId) {
      throw new BadRequestException('Invalid record ID');
    }
    return this.recordService.getRecordById(recordId);
  }

  @Get('element/:elementId')
  async findAll(@Param('elementId') elementId: string) {
    if (!elementId) {
      throw new BadRequestException('Invalid element ID');
    }
    return this.recordService.getAllRecords(elementId);
  }

  @Patch('update/:recordId')
  async update(
    @Param('recordId') recordId: string,
    @Body() updateRecordDto: UpdateRecordDto,
  ) {
    if (!recordId) {
      throw new BadRequestException('Invalid record ID');
    }

    await this.recordService.updateRecord(recordId, updateRecordDto);
    return { message: 'Record updated successfully' };
  }

  @Delete('delete/:recordId')
  async remove(@Param('recordId') recordId: string) {
    if (!recordId) {
      throw new BadRequestException('Invalid record ID');
    }

    await this.recordService.deleteRecord(recordId);
    return { message: 'Record deleted successfully' };
  }

  @Get('filter-by-tags')
  async getRecordsByTags(@Body() tags: { [key: string]: string }) {
    return this.recordService.getRecordsByTags(tags);
  }
}
