import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Successfully connected to PostgreSQL database');
    } catch (error) {
      this.logger.warn(`Initial database connection failed: ${(error as Error).message}. Will retry on request.`);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Disconnected from PostgreSQL database');
  }

  async checkHealth(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.logger.error(`Database health check failed: ${(error as Error).message}`);
      return false;
    }
  }
}
