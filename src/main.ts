import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/exceptionFilters/http-exception.filter';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const port = process.env.PORT || 3000;
  
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(port);
  console.log(`listening on port ${port}`);
}
bootstrap();
