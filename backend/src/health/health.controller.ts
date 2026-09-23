import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async checkHealth() {
    const isDbHealthy = await this.prisma.checkHealth();
    return {
      status: isDbHealthy ? 'ok' : 'degraded',
      service: 'telecom-network-backend',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      database: isDbHealthy ? 'connected' : 'disconnected',
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
