import { DocumentBuilder } from '@nestjs/swagger';
import { appConfig } from '../../config/app.config';

export const swaggerPath = appConfig.swaggerPath;

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Gifello API')
  .setDescription(
    'Gifello mobile and frontend integrations for the current versioned REST API.',
  )
  .setVersion('1.0')
  .addServer(`http://localhost:${appConfig.port}`, 'Local development')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Paste the access token returned by /v1/auth/login.',
    },
    'bearer',
  )
  .build();
