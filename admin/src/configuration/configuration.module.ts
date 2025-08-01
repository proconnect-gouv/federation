import { Module } from '@nestjs/common';
import { ConfigurationController } from './configuration.controller';
import { Configuration } from './entity/configuration.mongodb.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigurationService } from './configuration.service';
import { LocalsInterceptor } from '../meta/locals.interceptor';
import { TotpService } from '@pc/shared/authentication/totp/totp.service';
import { InstanceService } from '@pc/shared/utils';

@Module({
  imports: [TypeOrmModule.forFeature([Configuration], 'fc-mongo')],
  controllers: [ConfigurationController],
  providers: [
    LocalsInterceptor,
    ConfigurationService,
    TotpService,
    InstanceService,
  ],
})
export class ConfigurationModule {}
