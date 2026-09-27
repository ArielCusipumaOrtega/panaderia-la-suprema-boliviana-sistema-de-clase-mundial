import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  exito: boolean;
  data: T;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const req = context.switchToHttp().getRequest();
    // If request asks for html or raw static file, don't wrap
    if (req.url.startsWith('/portal') || req.url === '/' || req.url.startsWith('/api/docs')) {
      return next.handle();
    }
    return next.handle().pipe(
      map((data) => ({
        exito: true,
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
