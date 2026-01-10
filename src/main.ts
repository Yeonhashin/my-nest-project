import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // DTO에 없는 필드는 자동 제거
      forbidNonWhitelisted: true, // DTO에 없는 필드가 들어오면 에러
      transform: true,            // payload를 DTO 클래스로 자동 변환
    }),
  );

  await app.listen(3000, '0.0.0.0');
}
bootstrap();
