import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const startTime = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - startTime;
      const logLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'log';
      const logMessage = `${method} ${originalUrl} ${statusCode} - ${duration}ms [${ip}] "${userAgent}"`;

      if (logLevel === 'error') {
        this.logger.error(logMessage);
      } else if (logLevel === 'warn') {
        this.logger.warn(logMessage);
      } else {
        this.logger.log(logMessage);
      }
    });

    next();
  }
}
