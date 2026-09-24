import { Controller, Get, Query } from '@nestjs/common';
import { RadarService } from './radar.service';
import { RadarTelemetrySummary } from './radar.dto';

@Controller('radar')
export class RadarController {
  constructor(private readonly radarService: RadarService) {}

  /**
   * GET /api/radar/summary
   * Fetches real-time internet telemetry, IQI scores, and outage alarms
   */
  @Get('summary')
  async getSummary(
    @Query('country') country?: string,
    @Query('refresh') refresh?: string,
  ): Promise<RadarTelemetrySummary> {
    return this.radarService.getRadarSummary(country || 'ZM', refresh === 'true');
  }

  /**
   * GET /api/radar/status
   * Verifies the Cloudflare API token status
   */
  @Get('status')
  async getStatus() {
    return this.radarService.verifyToken();
  }
}
