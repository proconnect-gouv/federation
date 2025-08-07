import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.sql.entity';
import { FormModule } from '../form/form.module';
import { AccountController } from './account.controller';
import { UserModule } from '../user/user.module';
import { AccountService } from './account.service';
import { AuthenticationModule } from '../authentication/authentication.module';
import { TotpService } from '../authentication/totp/totp.service';
import { UserService } from '../user/user.service';
import * as generatePassword from 'generate-password';
import { MailerModule } from '../mailer/mailer.module';
import { EjsAdapter } from '../mailer/ejs.adapter';
import { ConfigModule, ConfigService } from 'nestjs-config';

const generatePasswordProvider = {
  provide: 'generatePassword',
  useValue: generatePassword,
};

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([User]),
    FormModule,
    AuthenticationModule,
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
  controllers: [AccountController],
  providers: [
    AccountService,
    UserService,
    TotpService,
    generatePasswordProvider,
  ],
})
export class AccountModule {}
