import { Module } from '@nestjs/common';
import { ConsoleModule } from 'nestjs-console';
import { UserModule } from '@fc/shared/user/user.module';
import { UserService } from '@fc/shared/user/user.service';
import { TotpService } from '@fc/shared/authentication/totp/totp.service';
import { CliService } from './cli.service';
import { MailerModule } from '../mailer/mailer.module';
import { EjsAdapter } from '../mailer/ejs.adapter';
import { ConfigModule, ConfigService } from 'nestjs-config';

@Module({
  imports: [
    ConsoleModule,
    UserModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        transport: config.get('transporter.transport'),
        emailOptions: config.get('transporter'),
        template: {
          dir: `${__dirname}/emails`,
          adapter: new EjsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [CliService, UserService, TotpService],
  exports: [CliService],
})
export class CliModule {}
