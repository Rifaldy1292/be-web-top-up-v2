import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { NestExpressApplication } from '@nestjs/platform-express';
import { existsSync, mkdirSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule); // <-- cast ke NestExpressApplication
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api');
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new ResponseInterceptor());

  // sekarang useStaticAssets tersedia
  // <-- process.cwd() = root project

  // Serve folder uploads
  const uploadPath = join(process.cwd(), 'uploads');
  if (!existsSync(uploadPath)) mkdirSync(uploadPath, { recursive: true });

  app.useStaticAssets(uploadPath, {
    prefix: '/uploads/',
    // Tambahkan ini untuk mencegah pencarian index.html
    index: false,
    // Opsional: Memastikan header content-type benar
    fallthrough: false,
  });

  const port = configService.get('PORT') || 3000;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
