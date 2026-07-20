import { ConfigModule, ConfigService } from "@fc/config";
import { DynamicModule, Module } from "@nestjs/common";
import nodemailer from "nodemailer";
import { BrevoAdapter } from "./adapters/brevo.adapter";
import { NoneAdapter } from "./adapters/none.adapter";
import { SmtpAdapter } from "./adapters/smtp.adapter";
import type { MailerConfig } from "./dto";
import { TransportType } from "./enums/transport-type.enum";
import { MailerService } from "./mailer.service";

@Module({})
export class MailerModule {
  static forRoot(): DynamicModule {
    return {
      module: MailerModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: MailerService,
          inject: [ConfigService],
          useFactory: (config: ConfigService): MailerService => {
            const mailerConfig = config.get<MailerConfig>("Mailer");
            if (mailerConfig.transport === TransportType.BREVO) {
              return new BrevoAdapter(mailerConfig, globalThis.fetch);
            }
            if (mailerConfig.transport === TransportType.SMTP) {
              return new SmtpAdapter(
                mailerConfig,
                nodemailer.createTransport(mailerConfig.smtpUrl),
              );
            }
            return new NoneAdapter();
          },
        },
      ],
      exports: [MailerService],
    };
  }
}
