import { Injectable } from '@nestjs/common';
import { ConfigService } from '@fc/config';
import { LoggerService } from '@fc/logger';
import { MailerConfig } from './dto';
import { MailOptions, Transport } from './interfaces';
import { MailjetTransport, StdoutTransport } from './transports';

@Injectable()
export class MailerService {
  private transport: Transport;

  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  onModuleInit() {
    const { transport } = this.config.get<MailerConfig>('Mailer');

    switch (transport) {
      case 'mailjet':
        this.transport = new MailjetTransport(this.config);
        break;
      case 'logs':
        this.transport = new StdoutTransport(this.logger);
        break;
      default:
        throw new Error(`Invalid mailer "${transport}"`);
    }
  }

  async send(params: MailOptions): Promise<unknown> {
    try {
      return this.transport.send(params);
    } catch (e) {
      this.logger.error(e);
    }
  }
}
