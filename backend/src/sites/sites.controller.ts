import { Controller, Get, Param, Query } from '@nestjs/common';
import { SitesService } from './sites.service';

@Controller('sites')
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  @Get()
  async findAll(@Query('status') status?: string, @Query('country') country?: string) {
    return this.sitesService.findAll(status, country);
  }

  @Get('summary')
  async getSummary() {
    return this.sitesService.getSummary();
  }

  @Get('topology')
  async getTopology() {
    return this.sitesService.getTopology();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.sitesService.findOne(id);
  }
}
