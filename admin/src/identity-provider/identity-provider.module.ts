import { Module } from '@nestjs/common';
import { IdentityProviderFromDb } from './identity-provider.mongodb.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IdentityProviderController } from './identity-provider.controller';
import { IdentityProviderService } from './identity-provider.service';
import { SecretManagerService } from '../utils/secret-manager.service';
import crypto from 'crypto';
import { PaginationService } from '../pagination';

const cryptoProvider = {
  provide: 'cryptoProvider',
  useValue: crypto,
};

@Module({
  imports: [TypeOrmModule.forFeature([IdentityProviderFromDb], 'fc-mongo')],
  controllers: [IdentityProviderController],
  providers: [
    IdentityProviderService,
    SecretManagerService,
    cryptoProvider,
    PaginationService,
  ],
  exports: [IdentityProviderService],
})
export class IdentityProviderModule {}
