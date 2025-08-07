import { Module } from '@nestjs/common';
import { IdentityProvider } from './identity-provider.mongodb.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IdentityProviderController } from './identity-provider.controller';
import { IdentityProviderService } from './identity-provider.service';
import { SecretManagerService } from '../utils/secret-manager.service';
import * as crypto from 'crypto';
import { InstanceService } from '../utils/instance.service';
import { FqdnToProvider } from '../fqdn-to-provider/fqdn-to-provider.mongodb.entity';
import { FqdnToProviderService } from '../fqdn-to-provider/fqdn-to-provider.service';
import { PaginationService } from '../pagination';

const cryptoProvider = {
  provide: 'cryptoProvider',
  useValue: crypto,
};

@Module({
  imports: [
    TypeOrmModule.forFeature([IdentityProvider, FqdnToProvider], 'fc-mongo'),
  ],
  controllers: [IdentityProviderController],
  providers: [
    IdentityProviderService,
    SecretManagerService,
    cryptoProvider,
    InstanceService,
    FqdnToProviderService,
    PaginationService,
  ],
  exports: [IdentityProviderService],
})
export class IdentityProviderModule {}
