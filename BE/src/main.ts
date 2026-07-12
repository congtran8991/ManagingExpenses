import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleLogger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const isProduction = process.env.NODE_ENV === 'production';

  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      prefix: 'Expense Management',
      json: isProduction,
      colors: !isProduction,
      timestamp: true,
    }),
  });

  const configService = app.get(ConfigService);

  // Enable CORS (Cross-Origin Resource Sharing)
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Set global API prefix
  app.setGlobalPrefix('api/v1');

  // Apply Global Validation Pipe for DTO validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Apply Global Exception Filter to handle errors
  app.useGlobalFilters(new HttpExceptionFilter());

  // Apply Global Transform Interceptor to format API responses
  app.useGlobalInterceptors(new TransformInterceptor());

  // Start Server
  const port = configService.get<number>('app.port') || 3001;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}/api/v1`);
}

void bootstrap();
