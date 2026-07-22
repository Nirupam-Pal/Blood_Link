import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('BloodLink Enterprise Ecosystem Engine Core')
  .setDescription('Production-grade high-throughput blood reserve inventory mapping & donor matrix API specifications')
  .setVersion('1.0.0')
  .addBearerAuth({
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    description: 'Provide operational JWT authorization tokens to access specialized role modules',
  })
  .build();