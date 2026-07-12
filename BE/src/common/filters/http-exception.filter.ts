import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response, Request } from 'express';
import { Prisma } from '@prisma/client'; // Import thêm Prisma để check type

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const methodName = request.route?.stack?.[0]?.name || 'unknownMethod';

    const errorPath = `${request.method} ${request.url}`;

    // 🌟 CÁCH ĐÚNG: Đảm bảo terminal sẽ in chữ MÀU ĐỎ
    this.logger.error('PATH: ' + errorPath);
    this.logger.error('METHOD', methodName);

    // 1. Khởi tạo các giá trị mặc định (Lỗi 500)
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';

    // 2. TRƯỜNG HỢP 1: Nếu là lỗi thông thường của NestJS (HttpException như 404, 400 Validation...)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseContent = exception.getResponse();

      if (typeof responseContent === 'object' && responseContent !== null) {
        // Ép kiểu sang Record<string, unknown> thay vì any để qua mặt ESLint an toàn
        const resObj = responseContent as Record<string, unknown>;
        message = typeof resObj.message === 'string' || Array.isArray(resObj.message) ? (resObj.message as string | string[]) : JSON.stringify(resObj);
      } else {
        message = responseContent;
      }
    }

    // 3. TRƯỜNG HỢP 2: Nếu là lỗi Database từ Prisma (Mã lỗi đã xác định - KnownRequestError)
    else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002': {
          // Trùng lặp dữ liệu Unique (Ví dụ: Trùng email, trùng tên sản phẩm)
          status = HttpStatus.CONFLICT;
          const target = (exception.meta?.target as string[])?.join(', ') || 'dữ liệu';
          message = `Giá trị của thuộc tính (${target}) đã tồn tại trên hệ thống.`;
          break;
        }

        case 'P2025': // Không tìm thấy bản ghi khi dữ liệu bị xóa hoặc sửa nhầm ID
          status = HttpStatus.NOT_FOUND;
          message = 'Không tìm thấy dữ liệu yêu cầu hoặc dữ liệu không tồn tại.';
          break;

        case 'P2003': // Lỗi khóa ngoại (Foreign key) - Ví dụ: Gán task vào một User không tồn tại
          status = HttpStatus.BAD_REQUEST;
          message = 'Dữ liệu liên kết không hợp lệ (Sai ID liên quan).';
          break;

        default:
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          message = `Lỗi cơ sở dữ liệu hệ thống (Mã lỗi: ${exception.code})`;
          break;
      }
    }

    // 4. TRƯỜNG HỢP 3: Lỗi Prisma dạng khác hoặc lỗi code Logic thông thường bị crash (bỏ qua để ko lộ log hệ thống)
    else if (exception instanceof Error) {
      // Bạn có thể console.error(exception) ở đây để xem log ở terminal lúc dev
      message = exception.message || 'Internal server error';
    }

    // 5. Trả về cấu hình JSON đồng nhất theo chuẩn bạn muốn
    const errorResponse = {
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: message,
    };

    response.status(status).json(errorResponse);
  }
}
