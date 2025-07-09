import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MailerModule } from '../mailer/mailer.module';
import { User } from './user.sql.entity';
import { Password } from './password.sql.entity';
import { UserService } from './user.service';
import * as generatePassword from 'generate-password';
import { LoggerService } from '@fc/shared/logger/logger.service';
import { ConfigModule, ConfigService } from 'nestjs-config';
import { EjsAdapter } from '../mailer/ejs.adapter';

const generatePasswordProvider = {
  provide: 'generatePassword',
  useValue: generatePassword,
};

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Password]),
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
  providers: [UserService, generatePasswordProvider, LoggerService],
  exports: [
    UserService,
    TypeOrmModule.forFeature([User]),
    generatePasswordProvider,
  ],
})
export class UserModule {}
