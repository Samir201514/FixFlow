import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();
    const sts = exception.getStatus();

    res.status(sts).json({
      success: false,
      statusCode: sts,
      error: exception.name,
      message: exception.message,
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
    });
  }
}
