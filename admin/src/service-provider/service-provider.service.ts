import { Repository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { LoggerService } from '../logger/logger.service';

import { ICrudTrack } from '../interfaces';
import { SecretManagerService } from '../utils/secret-manager.service';
import { SecretAdapter } from '../utils/secret.adapter';

import { ServiceProviderFromDb } from './service-provider.mongodb.entity';
import { ServiceProviderDto } from './dto/service-provider-input.dto';
import { PaginationOptions, PaginationService } from '../pagination';
import { GristPublisherService } from '../grist-publisher/grist-publisher.service';

@Injectable()
export class ServiceProviderService {
  constructor(
    @InjectRepository(ServiceProviderFromDb, 'fc-mongo')
    private readonly serviceProviderRepository: Repository<ServiceProviderFromDb>,
    private readonly secretManager: SecretManagerService,
    private readonly secretAdapter: SecretAdapter,
    private readonly logger: LoggerService,
    private readonly paginationService: PaginationService,
    private readonly gristPublisherService: GristPublisherService,
  ) {}

  private track(log: ICrudTrack) {
    this.logger.businessEvent(log);
  }

  async createServiceProvider(
    serviceProviderDto: ServiceProviderDto,
    user: string,
  ) {
    const serviceProviderDBEntity = this.transformDtoIntoEntity(
      serviceProviderDto,
      user,
    );

    const saveOperation = await this.serviceProviderRepository.insert(
      serviceProviderDBEntity,
    );

    this.track({
      entity: 'service-provider',
      action: 'create',
      user,
      name: serviceProviderDBEntity.key,
      id: saveOperation.identifiers[0].id,
    });

    const hasGristPublicationSucceeded =
      await this.publishServiceProvidersToGrist();

    return { hasGristPublicationSucceeded };
  }

  async findById(id: string): Promise<ServiceProviderFromDb> {
    const serviceProvider =
      await this.serviceProviderRepository.findOneByOrFail({
        _id: new ObjectId(id),
      });
    serviceProvider.client_secret = this.secretManager.decrypt(
      serviceProvider.client_secret,
    );
    return serviceProvider;
  }

  async update(id: string, input: ServiceProviderDto, user: string) {
    const serviceProvider =
      await this.serviceProviderRepository.findOneByOrFail({
        _id: new ObjectId(id),
      });

    serviceProvider.name = input.name;
    serviceProvider.redirect_uris = input.redirectUri;
    serviceProvider.post_logout_redirect_uris = input.redirectUriLogout;
    serviceProvider.type = input.type;
    serviceProvider.email = input.emails.join('\n');
    serviceProvider.active = input.active;
    serviceProvider.IPServerAddressesAndRanges = input.ipAddresses;
    serviceProvider.updatedAt = new Date();
    serviceProvider.updatedBy = user;
    serviceProvider.userinfo_signed_response_alg =
      input.userinfo_signed_response_alg;
    serviceProvider.id_token_signed_response_alg =
      input.id_token_signed_response_alg;
    serviceProvider.introspection_signed_response_alg =
      input.introspection_signed_response_alg;
    serviceProvider.introspection_encrypted_response_alg =
      input.introspection_encrypted_response_alg;
    serviceProvider.introspection_encrypted_response_enc =
      input.introspection_encrypted_response_enc;
    serviceProvider.response_types = input.response_types;
    serviceProvider.grant_types = input.grant_types;
    serviceProvider.jwks_uri = input.jwks_uri;

    /*
     * Since we have "legacy SPs" with no scope at all, we want to describe some rules
     * to update the scopes:
     * - If the user, send scopes (input.scopes) or the SP already has scopes (serviceProvider.scopes)
     * we want at least the scope "openid".
     * - If the user doesn't send scopes but the SP already have scopes, we want at least the scope "openid".
     * - If the user doesn't send scope AND the SP doesn't have scopes, we do not want to update scopes because
     * this SP is legacy and we do not want any filter.
     * - If the user send scope AND the SP doesn't have scopes, we want least the scope "openid".
     */
    if (input.scopes || serviceProvider.scopes) {
      const uniqueScopes = new Set(['openid', ...(input.scopes || [])]);

      serviceProvider.scopes = [...uniqueScopes];
    }

    this.track({
      entity: 'service-provider',
      action: 'update',
      user,
      id,
      name: serviceProvider.key,
    });

    await this.serviceProviderRepository.save(serviceProvider);

    const hasGristPublicationSucceeded =
      await this.publishServiceProvidersToGrist();

    return { hasGristPublicationSucceeded };
  }

  /**
   * Due to multiple bugs in typeorm with mongodb,
   * we have a hard time retrieving multiple sp by id.
   *
   * Dirty costly solution: iterate through given ids
   */
  async deleteManyServiceProvidersById(ids: string[], user: string) {
    await Promise.all(
      ids.map((id) => this.deleteServiceProviderById(id, user)),
    );

    // we do not know how to update grist after a deletion
    return { hasGristPublicationSucceeded: false };
  }

  async deleteServiceProviderById(id: string, user: string) {
    const serviceProvider =
      await this.serviceProviderRepository.findOneByOrFail({
        _id: new ObjectId(id),
      });

    const result = await this.serviceProviderRepository.delete({
      _id: new ObjectId(id),
    });
    const hasDeletionSucceeded = result.affected === 1;

    this.track({
      entity: 'service-provider',
      action: 'delete',
      user,
      id,
      name: serviceProvider.key,
    });

    // we do not know how to update grist after a deletion
    return { hasGristPublicationSucceeded: false, hasDeletionSucceeded };
  }

  async generateNewSecret(
    serviceProviderID: string,
    currentUser: string,
  ): Promise<ServiceProviderFromDb> {
    const serviceProvider =
      await this.serviceProviderRepository.findOneByOrFail({
        _id: new ObjectId(serviceProviderID),
      });

    const unEncryptedSecret = this.secretAdapter.generateSecret();

    const newClientSecret = this.secretManager.encrypt(unEncryptedSecret);

    const now = new Date();

    serviceProvider.client_secret = newClientSecret;
    serviceProvider.updatedAt = now;
    serviceProvider.secretUpdatedAt = now;
    serviceProvider.secretUpdatedBy = currentUser;

    return this.serviceProviderRepository.save(serviceProvider);
  }

  async paginate(options: PaginationOptions) {
    const paginationParams =
      this.paginationService.buildPaginationParams(options);

    const [items, total] =
      await this.serviceProviderRepository.findAndCount(paginationParams);

    return { items, total };
  }

  private transformDtoIntoEntity(
    serviceProviderDto: ServiceProviderDto,
    user: string,
  ): Omit<ServiceProviderFromDb, '_id'> {
    const now = new Date();
    const key = this.secretAdapter.generateKey();

    return {
      title: serviceProviderDto.name,
      name: serviceProviderDto.name,
      redirect_uris: serviceProviderDto.redirectUri,
      post_logout_redirect_uris: serviceProviderDto.redirectUriLogout,
      type: serviceProviderDto.type,
      email: serviceProviderDto.emails.join('\n'),
      IPServerAddressesAndRanges: serviceProviderDto.ipAddresses,
      scopes: serviceProviderDto.scopes,
      userinfo_signed_response_alg:
        serviceProviderDto.userinfo_signed_response_alg,
      id_token_signed_response_alg:
        serviceProviderDto.id_token_signed_response_alg,
      introspection_signed_response_alg:
        serviceProviderDto.introspection_signed_response_alg,
      introspection_encrypted_response_alg:
        serviceProviderDto.introspection_encrypted_response_alg,
      introspection_encrypted_response_enc:
        serviceProviderDto.introspection_encrypted_response_enc,
      response_types: serviceProviderDto.response_types,
      grant_types: serviceProviderDto.grant_types,
      jwks_uri: serviceProviderDto.jwks_uri,
      active: serviceProviderDto.active,
      client_secret: this.secretManager.encrypt(
        this.secretAdapter.generateSecret(),
      ),
      secretCreatedAt: now,
      createdAt: now,
      updatedAt: now,
      secretUpdatedAt: now,
      updatedBy: user,
      secretUpdatedBy: user,
      key,
    };
  }

  private async publishServiceProvidersToGrist() {
    const allServiceProviders = await this.serviceProviderRepository.find();
    return this.gristPublisherService.publishServiceProviders(
      allServiceProviders,
    );
  }
}
