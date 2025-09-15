import { v4 as uuidv4 } from 'uuid';
import { DeleteResult, Repository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { ConfigService } from 'nestjs-config';

import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';

import { linesToArray } from '../utils/transforms/string.transform';
import { LoggerService } from '../logger/logger.service';

import { ICrudTrack } from '../interfaces';
import { SecretManagerService } from '../utils/secret-manager.service';

import { IdentityProviderFromDb } from './identity-provider.mongodb.entity';
import { FqdnToProviderService } from '../fqdn-to-provider/fqdn-to-provider.service';
import { PaginationOptions, PaginationService } from '../pagination';
import { IdentityProviderDTO } from './dto/identity-provider.dto';

@Injectable()
export class IdentityProviderService {
  constructor(
    @InjectRepository(IdentityProviderFromDb, 'fc-mongo')
    private readonly identityProviderRepository: Repository<IdentityProviderFromDb>,
    private readonly secretManager: SecretManagerService,
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
    private readonly fqdnToProviderService: FqdnToProviderService,
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
    const fqdns = identityProviderDto.fqdns || [];

    const providerToSave = this.transformDtoToEntity(
      identityProviderDto,
      username,
      'create',
    );

    const saveOperation =
      await this.identityProviderRepository.insert(providerToSave);

    if (fqdns.length > 0) {
      await this.fqdnToProviderService.saveFqdnsProvider(
        providerToSave.uid,
        fqdns,
      );
    }

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

    const fqdns = identityProviderDto.fqdns || [];

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

    /**
     * We need to update the corresponding fqdn
     * note: we don't return the result of this update.
     */
    await this.fqdnToProviderService.updateFqdnsProvider(
      existingProvider.uid,
      fqdns,
    );

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

    await this.fqdnToProviderService.deleteFqdnsProvider(identityProvider.uid);

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
      image: identityProviderDto.image,
      imageFocus: identityProviderDto.imageFocus,
      alt: identityProviderDto.alt,
      allowedAcr: identityProviderDto.allowedAcr,
      discovery: identityProviderDto.discovery,
      isBeta: identityProviderDto.isBeta,
      order: identityProviderDto.order,
      siret: identityProviderDto.siret,
      discoveryUrl: identityProviderDto.discoveryUrl,
      jwtAlgorithm: [],
      blacklistByIdentityProviderActivated: false,
      WhitelistByServiceProviderActivated: false,
      hoverMsg: identityProviderDto.messageToDisplayWhenInactive,
      hoverRedirectLink: identityProviderDto.redirectionTargetWhenInactive,
      clientID: identityProviderDto.clientId,
      authzURL: identityProviderDto.authorizationUrl,
      statusURL: identityProviderDto.statusUrl,
      tokenURL: identityProviderDto.tokenUrl,
      userInfoURL: identityProviderDto.userInfoUrl,
      endSessionURL: identityProviderDto.logoutUrl,
      jwksURL: identityProviderDto.jwksUrl,
      amr: identityProviderDto.amr,
      mailto: identityProviderDto.emails.join('\r\n'),
      url: identityProviderDto.issuer,
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
      specificText:
        identityProviderDto.specificText ||
        'Une erreur est survenue lors de la transmission de votre identité.',
    };

    switch (mode) {
      case 'create':
        Object.assign(entity, {
          uid: uuidv4(),
          createdAt: now,
          active: false,
        });
        break;
      case 'update':
        Object.assign(entity, {
          active: identityProviderDto.active,
        });
        break;
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
      isBeta: inputProvider.isBeta,
      order: inputProvider.order,
      siret: inputProvider.siret,
      client_secret: inputProvider.client_secret,
      alt: inputProvider.alt,
      image: inputProvider.image,
      imageFocus: inputProvider.imageFocus,
      active: inputProvider.active,
      allowedAcr: inputProvider.allowedAcr,
      specificText: inputProvider.specificText,
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
      messageToDisplayWhenInactive: inputProvider.hoverMsg,
      redirectionTargetWhenInactive: inputProvider.hoverRedirectLink,
      clientId: inputProvider.clientID,
      authorizationUrl: inputProvider.authzURL,
      statusUrl: inputProvider.statusURL,
      tokenUrl: inputProvider.tokenURL,
      userInfoUrl: inputProvider.userInfoURL,
      logoutUrl: inputProvider.endSessionURL,
      jwksUrl: inputProvider.jwksURL,
      emails: linesToArray({ value: inputProvider.mailto }),
      issuer: inputProvider.url,
      amr: inputProvider.amr,
      modalActive: inputProvider.modal?.active,
      modalTitle: inputProvider.modal?.title,
      modalBody: inputProvider.modal?.body,
      modalContinueText: inputProvider.modal?.continueText,
      modalMoreInfoLabel: inputProvider.modal?.moreInfoLabel,
      modalMoreInfoUrl: inputProvider.modal?.moreInfoUrl,
    };
  }
}
