import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaginationService } from '../pagination';

import { FileStorage } from '../file-storage/file-storage.mongodb.entity';
import { IdentityProviderModule } from '../identity-provider';
import { SecretManagerService } from '../utils/secret-manager.service';
import { SecretAdapter } from '../utils/secret.adapter';
import { FileStorageService } from '../file-storage/file-storage.service';
import { ScopesModule } from '../scopes';
import { ClaimsModule } from '../claims';

import { ServiceProviderService } from './service-provider.service';
import { ServiceProviderController } from './service-provider.controller';
import { ServiceProviderFromDb } from './service-provider.mongodb.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServiceProviderFromDb, FileStorage], 'fc-mongo'),
    ScopesModule,
    ClaimsModule,
    IdentityProviderModule,
  ],
  controllers: [ServiceProviderController],
  providers: [
    PaginationService,
    ServiceProviderService,
    SecretManagerService,
    FileStorageService,
    SecretAdapter,
  ],
})
export class ServiceProviderModule {}
