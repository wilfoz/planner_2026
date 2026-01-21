import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class WrapperDataInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((body) => {
        if (!body) return body;
        if (typeof body === 'object' && body !== null) {
          if ('accessToken' in body) return body;
          if ('meta' in body) return body;
        }
        return { data: body };
      }),
    );
  }
}

