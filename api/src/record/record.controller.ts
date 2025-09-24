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
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { RecordService } from './record.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { StructurePermissionGuard } from 'src/auth/guards/structure-permission.guard';
@Controller('records')
@UseGuards(JwtAuthGuard, StructurePermissionGuard)
export class RecordController {
  constructor(private readonly recordService: RecordService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async create(
    @Query('elementId') elementId: string,
    @Body() createRecordDto: CreateRecordDto,
    @Req() req: any,
  ) {
    if (!elementId) {
      throw new BadRequestException('Invalid element ID');
    }
    const userId = req.user?.id || null;
    const newRecord = await this.recordService.createRecord(
      elementId,
      createRecordDto,
      userId,
    );
    return { message: 'Record created successfully', recordId: newRecord.id };
  }

  @Get('record/:recordId')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('recordId') recordId: string) {
    if (!recordId) {
      throw new BadRequestException('Invalid record ID');
    }
    return this.recordService.getRecordById(recordId);
  }

  @Get('element/:elementId')
  @UseGuards(JwtAuthGuard)
  async findAll(@Param('elementId') elementId: string) {
    if (!elementId) {
      throw new BadRequestException('Invalid element ID');
    }
    return this.recordService.getAllRecords(elementId);
  }

  @Patch('update/:recordId')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('recordId') recordId: string,
    @Body() updateRecordDto: UpdateRecordDto,
    @Req() req: any,
  ) {
    if (!recordId) {
      throw new BadRequestException('Invalid record ID');
    }
    const userId = req.user?.id || null;
    await this.recordService.updateRecord(recordId, updateRecordDto, userId);
    return { message: 'Record updated successfully' };
  }

  @Delete('delete/:recordId')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('recordId') recordId: string, @Req() req: any) {
    if (!recordId) {
      throw new BadRequestException('Invalid record ID');
    }
    const userId = req.user?.id || null;
    await this.recordService.deleteRecord(recordId, userId);
    return { message: 'Record deleted successfully' };
  }

  @Get('filter-by-tags')
  @UseGuards(JwtAuthGuard)
  async getRecordsByTags(@Body() tags: { [key: string]: string }) {
    return this.recordService.getRecordsByTags(tags);
  }
}
