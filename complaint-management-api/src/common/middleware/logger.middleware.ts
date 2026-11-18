import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const reqTime = Date.now();
    res.on('finish', () => {
      const resTime = Date.now();
      const requestId = res.locals.requestId;

      this.logger.log(
        `[${requestId}] ${req.method} ${req.originalUrl} ${res.statusCode}- ${resTime - reqTime} ms`,
      );
    });
    next();
  }
}
