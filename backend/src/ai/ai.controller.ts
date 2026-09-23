import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { AiService } from './ai.service';
import { DiagnoseSiteDto } from './ai.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /**
   * GET /api/ai/weekly-report
   * Generates executive weekly network operations & focus report
   */
  @Get('weekly-report')
  async getWeeklyReport() {
    return this.aiService.generateWeeklyReport();
  }

  /**
   * POST /api/ai/weekly-report
   */
  @Post('weekly-report')
  async postWeeklyReport() {
    return this.aiService.generateWeeklyReport();
  }

  /**
   * POST /api/ai/diagnose/:id
   * Executes AI diagnostic analysis for a specific site ID or siteCode
   */
  @Post('diagnose/:id')
  async diagnosePost(@Param('id') id: string, @Body() dto?: DiagnoseSiteDto) {
    return this.aiService.diagnoseSite(id, dto);
  }

  /**
   * GET /api/ai/diagnose/:id
   * Convenience endpoint for browser or CLI curl testing
   */
  @Get('diagnose/:id')
  async diagnoseGet(@Param('id') id: string) {
    return this.aiService.diagnoseSite(id);
  }
}
