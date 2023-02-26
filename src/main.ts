import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { winstonLogger } from './common/utils/winston.util';
import { HttpExceptionFilter } from './common/exceptionFilters/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: winstonLogger,
  });
  const configService = app.get(ConfigService);
  app.enableCors({ origin: true, credentials: true });
  const port = configService.get<number>('PORT', 3000);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(port);
  console.log(`listening on port ${port}`);
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
