import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Response as ExpressResponse } from 'express'; // 🔥 Import Type chuẩn của Express
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Định nghĩa cấu trúc JSON đầu ra rõ ràng
export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data: T | null;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();

    // 🔥 ÉP KIỂU AN TOÀN: Báo cho TS biết đây là Response của Express chứ không phải 'any'
    const response = ctx.getResponse<ExpressResponse>();

    const statusCode = response.statusCode; // Hết lỗi unsafe member access!

    return next.handle().pipe(
      map((data: T) => ({
        success: true,
        message: 'Success',
        statusCode,
        // Nếu service trả về undefined hoặc không có data, ép về null để JSON đồng bộ
        data: data !== undefined ? data : null,
      })),
    );
  }
}
