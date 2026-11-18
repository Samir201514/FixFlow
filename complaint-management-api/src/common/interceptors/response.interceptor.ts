import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((response) => ({
        success: true,
        message: response?.message ?? 'Request successful',
        data: response?.data ?? response,
        meta: response?.meta ?? null,
      })),
    );
  }
}
