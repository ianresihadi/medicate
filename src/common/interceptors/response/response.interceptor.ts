import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, unknown> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data: Record<string, unknown>) => {
        const { meta, ...result } = data;
        if (!meta) {
          return {
            data,
          };
        }

        return {
          meta,
          data: result?.data,
        };
      })
    );
  }
}
