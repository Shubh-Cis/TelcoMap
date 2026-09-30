import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('TelecomBackend');
  const app = await NestFactory.create(AppModule);

  // Security headers via Helmet
  app.use(
    helmet({
      contentSecurityPolicy: false, // Allows flexible integration in dev/local environments
    }),
  );

  // Enable Cross-Origin Resource Sharing
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global API routing prefix
  app.setGlobalPrefix('api');

  // Input validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = process.env.PORT || process.env.BACKEND_PORT || 3001;
  const host = '0.0.0.0';

  await app.listen(port, host);
  logger.log(`=======================================================`);
  logger.log(`Telecom Network Operations Backend Running`);
  logger.log(`URL: http://${host}:${port}/api`);
  logger.log(`Health Check: http://${host}:${port}/api/health`);
  logger.log(`Network Sites API: http://${host}:${port}/api/sites`);
  logger.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.log(`=======================================================`);
}

bootstrap();
