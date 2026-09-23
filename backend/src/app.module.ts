import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module';
import { SitesModule } from './sites/sites.module';
import { DevicesModule } from './devices/devices.module';
import { HealthModule } from './health/health.module';
import { AiModule } from './ai/ai.module';
import { RequestLoggerMiddleware } from './common/logger/request-logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    SitesModule,
    DevicesModule,
    HealthModule,
    AiModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
