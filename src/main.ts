import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { winstonLogger } from './common/utils/winston.util';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: winstonLogger,
  });

  app.enableCors({ origin: true, credentials: true });
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`listening on port ${port}`);
}
bootstrap();
