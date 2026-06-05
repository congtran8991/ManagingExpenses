import { Controller, Get, Res } from '@nestjs/common';
import * as client from 'prom-client'; // 🔥 Gọi trực tiếp thư viện gốc
import type { Response } from 'express';

@Controller('metrics') // Kết hợp với Global Prefix sẽ tự động thành 'api/v1/metrics'
export class MetricsController {
  constructor() {
    // Tự động dọn dẹp các metric cũ khi sửa code để tránh lỗi trùng lặp (Crash app)
    client.register.clear();

    // Kích hoạt tính năng tự động đo đạc RAM, CPU, Event Loop của NodeJS
    client.collectDefaultMetrics({
      register: client.register,
    });
  }

  @Get()
  async getMetrics(@Res() res: Response): Promise<void> {
    // Thiết lập Header chuẩn Plain Text cho Prometheus
    res.set('Content-Type', client.register.contentType);

    // Lấy toàn bộ dữ liệu chỉ số hệ thống dạng chữ (String)
    const metricsContent = await client.register.metrics();

    // Trả về kết quả raw, bypass hoàn toàn TransformInterceptor của NestJS
    res.end(metricsContent);
  }
}
