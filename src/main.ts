import 'dotenv/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appConfig } from './config/app.config';
import { PrismaService } from './database/prisma/prisma.service';
import { setupSwagger } from './docs/swagger/setup-swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.get(PrismaService).enableShutdownHooks(app);
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  app.enableCors({
    origin: appConfig.corsOrigin === '*' ? true : appConfig.corsOrigin,
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  setupSwagger(app);
  await app.listen(appConfig.port);
}
void bootstrap();
