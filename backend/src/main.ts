import { NestFactory } from '@nestjs/core';
import { INestApplicationContext, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { AppModule } from './app.module';

const DEFAULT_CORS_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000'];

// Comma-separated list in CORS_ORIGINS, e.g. "https://bloodlink.vercel.app,https://bloodlink.in"
function parseCorsOrigins(value?: string): string[] {
  const origins = (value || '')
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean);
  return origins.length ? origins : DEFAULT_CORS_ORIGINS;
}

// Applies the same allowed origins to the Socket.IO (chat) server as to HTTP.
class CorsIoAdapter extends IoAdapter {
  constructor(
    app: INestApplicationContext,
    private readonly origins: string[],
  ) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions) {
    return super.createIOServer(port, {
      ...options,
      cors: { origin: this.origins, credentials: true },
    });
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const corsOrigins = parseCorsOrigins(app.get(ConfigService).get<string>('CORS_ORIGINS'));

  // Without this, every @IsEnum/@IsInt/@Min decorator on our DTOs is inert
  // and invalid payloads (e.g. mismatched enum values) pass through silently.
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Enable CORS
  app.enableCors({
    origin: corsOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  app.useWebSocketAdapter(new CorsIoAdapter(app, corsOrigins));

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Backend server running on http://localhost:${port}`);
  console.log(`Allowed origins: ${corsOrigins.join(', ')}`);
}
bootstrap();
