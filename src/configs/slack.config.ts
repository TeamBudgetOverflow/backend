import { ConfigService, registerAs } from '@nestjs/config';

export default registerAs('slack', () => ({
  url: new ConfigService().get<string>('SLACK_WEBHOOK_URL'),
}));
