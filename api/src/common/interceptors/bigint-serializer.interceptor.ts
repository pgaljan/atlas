import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

function convertBigInts(value: unknown): unknown {
  if (value === null || value === undefined) return value;

  const valueType = typeof value;

  if (valueType === 'bigint') return (value as bigint).toString();
  if (Array.isArray(value)) {
    return value.map(convertBigInts);
  }
  if (value instanceof Date) return value;
 if (valueType === 'object' && value.constructor === Object) {
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, val]) => [
      key,
      convertBigInts(val),
    ]),
  );
}

  return value;
}

@Injectable()
export class BigIntSerializerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => convertBigInts(data)));
  }
}
