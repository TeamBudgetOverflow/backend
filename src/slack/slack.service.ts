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

  async sendSlackNotification(email: string, data) {
    return this.webhook
      .send({
        text: `Reporter: ${email}\n
            ReportId:${data.reportId}\n
            GoalId: ${data.goalId}\n
            ReportedCount: ${data.reportedCount}\n
            Reason: ${data.reason}`,
      })
      .then(() => {
        this.logger.log(
          `slack push notification sent to #report-notifications - ${email} reported the goal ${data.goalId}`,
        );
      })
      .catch((e) => {
        this.logger.error('Slack push notification failed', e);
      });
  }
}
