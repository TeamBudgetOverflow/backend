import { registerAs } from '@nestjs/config';
import * as dotenv from 'dotenv';

dotenv.config();

export default registerAs('slack', () => ({
  url: process.env.SLACK_WEBHOOK_URL,
}));
