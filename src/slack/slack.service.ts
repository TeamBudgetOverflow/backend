import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IncomingWebhook } from '@slack/webhook';

@Injectable()
export class SlackService {
  private logger = new Logger(SlackService.name);
  private webhook: IncomingWebhook;
  constructor(private readonly configService: ConfigService) {
    this.webhook = new IncomingWebhook(
      this.configService.get<string>('slack.url'),
    );
  }

  async sendSlackNotification(goalId: number, count: number, data) {
    let stringifyData = '';
    for (let i = 0; i < data.length; i++) {
      stringifyData += `UserEmail : ${data[i].userEmail}\n
      Reason : ${data[i].reason}\n`;
    }
    return this.webhook
      .send({
        text: `GoalId: ${goalId}\n
            ReportedCount: ${count}\n
            ${stringifyData}`,
      })
      .then(() => {
        this.logger.log(
          `slack push notification sent to #report-notifications - reported the goal ${goalId}`,
        );
      })
      .catch((e) => {
        this.logger.error('Slack push notification failed', e);
      });
  }
}
