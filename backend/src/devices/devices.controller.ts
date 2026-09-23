import { Controller, Get, Param, Query } from '@nestjs/common';
import { DevicesService } from './devices.service';

@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Get()
  async findAll(@Query('siteId') siteId?: string, @Query('status') status?: string) {
    return this.devicesService.findAll(siteId, status);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.devicesService.findOne(id);
  }
}
