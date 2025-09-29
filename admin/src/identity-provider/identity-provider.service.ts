import { v4 as uuidv4 } from 'uuid';
import { DeleteResult, Repository } from 'typeorm';
import { ObjectId } from 'mongodb';

import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';

import { LoggerService } from '../logger/logger.service';

import { ICrudTrack } from '../interfaces';
import { SecretManagerService } from '../utils/secret-manager.service';

import { IdentityProviderFromDb } from './identity-provider.mongodb.entity';
import { PaginationOptions, PaginationService } from '../pagination';
import { IdentityProviderDTO } from './dto/identity-provider.dto';

@Injectable()
export class IdentityProviderService {
  constructor(
    @InjectRepository(IdentityProviderFromDb, 'fc-mongo')
    private readonly identityProviderRepository: Repository<IdentityProviderFromDb>,
    private readonly secretManager: SecretManagerService,
    private readonly logger: LoggerService,
    private readonly paginationService: PaginationService,
  ) {}

  private track(log: ICrudTrack) {
    this.logger.businessEvent(log);
  }

  async getAll(): Promise<IdentityProviderFromDb[]> {
    try {
      const result = await this.identityProviderRepository.find();
      return result;
    } catch ({ message }) {
      const msg = `Unable to retrieve all identity providers : ${message}`;
      this.logger.error(msg);
      throw new Error(msg);
    }
  }

  async countIdentityProviders() {
    return this.identityProviderRepository.count();
  }

  async create(identityProviderDto: IdentityProviderDTO, username: string) {
    const providerToSave = this.transformDtoToEntity(
      identityProviderDto,
      username,
      'create',
    );

    const saveOperation =
      await this.identityProviderRepository.insert(providerToSave);

    const identityProviderId = saveOperation.identifiers[0]._id;

    this.track({
      entity: 'identity-provider',
      action: 'create',
      user: username,
      id: identityProviderId,
      name: identityProviderDto.name,
    });

    return identityProviderId;
  }

  async findById(
    id: string,
  ): Promise<{ identityProviderDto: IdentityProviderDTO; uid: string }> {
    const identityProviderFromDb =
      await this.identityProviderRepository.findOne({
        where: {
          _id: new ObjectId(id),
        },
      });

    if (!identityProviderFromDb) {
      throw new NotFoundException();
    }

    identityProviderFromDb.client_secret = this.secretManager.decrypt(
      identityProviderFromDb.client_secret,
    );

    const identityProviderDto = this.transformEntityToDto(
      identityProviderFromDb,
    );

    return { identityProviderDto, uid: identityProviderFromDb.uid };
  }

  async update(
    identityProviderId: string,
    identityProviderDto: IdentityProviderDTO,
    user: string,
  ) {
    this.track({
      entity: 'identity-provider',
      action: 'update',
      user,
      id: identityProviderId,
      name: identityProviderDto.name,
    });

    const providerToSave = this.transformDtoToEntity(
      identityProviderDto,
      user,
      'update',
    );

    const existingProvider =
      await this.identityProviderRepository.findOneByOrFail({
        _id: new ObjectId(identityProviderId),
      });

    // Apply the updates from providerToSave
    Object.assign(existingProvider, providerToSave);

    // Save the updated provider
    const identityProviderResponse =
      await this.identityProviderRepository.save(existingProvider);

    return identityProviderResponse;
  }

  async deleteIdentityProvider(
    id: string,
    user: string,
  ): Promise<DeleteResult> {
    const identityProvider =
      await this.identityProviderRepository.findOneByOrFail({
        _id: new ObjectId(id),
      });

    this.track({
      entity: 'identity-provider',
      action: 'delete',
      user,
      id,
      name: identityProvider.name,
    });

    return this.identityProviderRepository.delete({ _id: new ObjectId(id) });
  }

  async paginate(options: PaginationOptions) {
    const paginationParams =
      this.paginationService.buildPaginationParams(options);

    const [items, total] =
      await this.identityProviderRepository.findAndCount(paginationParams);

    return { items, total };
  }

  private transformDtoToEntity(
    identityProviderDto: IdentityProviderDTO,
    username: string,
    mode: 'create' | 'update',
  ): Omit<IdentityProviderFromDb, '_id'> {
    const now = new Date();

    const clientSecret = this.secretManager.encrypt(
      identityProviderDto.client_secret,
    );

    const entity = {
      updatedAt: now,
      updatedBy: username,
      client_secret: clientSecret,
      name: identityProviderDto.name,
      title: identityProviderDto.title,
      discovery: identityProviderDto.discovery,
      siret: identityProviderDto.siret,
      discoveryUrl: identityProviderDto.discoveryUrl,
      clientID: identityProviderDto.clientId,
      authzURL: identityProviderDto.authorizationUrl,
      statusURL: identityProviderDto.statusUrl,
      tokenURL: identityProviderDto.tokenUrl,
      userInfoURL: identityProviderDto.userInfoUrl,
      endSessionURL: identityProviderDto.logoutUrl,
      jwksURL: identityProviderDto.jwksUrl,
      url: identityProviderDto.issuer,
      active: identityProviderDto.active,
      userinfo_encrypted_response_enc:
        identityProviderDto.userinfo_encrypted_response_enc,
      userinfo_encrypted_response_alg:
        identityProviderDto.userinfo_encrypted_response_alg,
      userinfo_signed_response_alg:
        identityProviderDto.userinfo_signed_response_alg,
      id_token_signed_response_alg:
        identityProviderDto.id_token_signed_response_alg,
      id_token_encrypted_response_alg:
        identityProviderDto.id_token_encrypted_response_alg,
      id_token_encrypted_response_enc:
        identityProviderDto.id_token_encrypted_response_enc,
      token_endpoint_auth_method:
        identityProviderDto.token_endpoint_auth_method,
      supportEmail: identityProviderDto.supportEmail,
      isRoutingEnabled: identityProviderDto.isRoutingEnabled,
      fqdns: identityProviderDto.fqdns,
    };

    if (mode === 'create') {
      Object.assign(entity, {
        uid: uuidv4(),
        createdAt: now,
      });
    }

    return entity as any;
  }

  private transformEntityToDto(
    identityProviderFromDb: IdentityProviderFromDb,
  ): IdentityProviderDTO {
    const inputProvider = {
      ...identityProviderFromDb,
    };

    return {
      name: inputProvider.name,
      title: inputProvider.title,
      discovery: inputProvider.discovery,
      siret: inputProvider.siret,
      client_secret: inputProvider.client_secret,
      active: inputProvider.active,
      discoveryUrl: inputProvider.discoveryUrl,
      id_token_encrypted_response_enc:
        inputProvider.id_token_encrypted_response_enc,
      id_token_encrypted_response_alg:
        inputProvider.id_token_encrypted_response_alg,
      id_token_signed_response_alg: inputProvider.id_token_signed_response_alg,
      userinfo_signed_response_alg: inputProvider.userinfo_signed_response_alg,
      userinfo_encrypted_response_alg:
        inputProvider.userinfo_encrypted_response_alg,
      userinfo_encrypted_response_enc:
        inputProvider.userinfo_encrypted_response_enc,
      supportEmail: inputProvider.supportEmail,
      clientId: inputProvider.clientID,
      authorizationUrl: inputProvider.authzURL,
      statusUrl: inputProvider.statusURL,
      tokenUrl: inputProvider.tokenURL,
      userInfoUrl: inputProvider.userInfoURL,
      logoutUrl: inputProvider.endSessionURL,
      jwksUrl: inputProvider.jwksURL,
      issuer: inputProvider.url,
      isRoutingEnabled: inputProvider.isRoutingEnabled,
      fqdns: inputProvider.fqdns,
    };
  }
}
