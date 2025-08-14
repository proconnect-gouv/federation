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
import { IIdentityProvider } from './interface/identity-provider.interface';
import { IIdentityProviderLegacy } from './interface/identity-provider-legacy.interface';
import { ModifierData } from './interface/modifier-data.interface';
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
    const identityProviderDtoWithDefaultValues =
      await this.addDefaultValuesToDto(identityProviderDto);

    const fqdns = identityProviderDto.fqdns || [];

    const providerToSave = await this.transformDtoToEntity(
      identityProviderDtoWithDefaultValues,
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

  async findById(id: string): Promise<IIdentityProvider> {
    const identityProviderFromDb =
      await this.identityProviderRepository.findOne({
        where: {
          _id: ObjectId(id),
        },
      });

    if (!identityProviderFromDb) {
      throw new NotFoundException();
    }

    identityProviderFromDb.client_secret = this.secretManager.decrypt(
      identityProviderFromDb.client_secret,
    );

    const identityProvider = this.tranformFromLegacy(identityProviderFromDb);

    return identityProvider;
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

    /**
     * We need to keep the fqdns from the provider object for fca
     * the transform operation will remove them
     */
    const identityProviderInput = { ...identityProviderDto };

    const providerToSave = await this.transformDtoToEntity(
      identityProviderDto,
      user,
      'update',
    );

    // Find the existing provider
    const existingProvider =
      await this.identityProviderRepository.findOneByOrFail({
        _id: ObjectId(identityProviderId),
      });

    // Apply the updates from providerToSave
    Object.assign(existingProvider, providerToSave);

    // Save the updated provider
    const identityProviderResponse =
      await this.identityProviderRepository.save(existingProvider);

    /**
     *  We need to update the corresponding fqdn
     * note : we don't return the result of the update of the fqdns
     */
    await this.fqdnToProviderService.updateFqdnsProvider(
      identityProviderResponse.uid,
      identityProviderInput.fqdns,
      identityProviderId,
    );

    return identityProviderResponse;
  }

  async deleteIdentityProvider(id, user: string): Promise<DeleteResult> {
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

  private async transformDtoToEntity(
    identityProviderDto: IdentityProviderDTO,
    username: string,
    mode: 'create' | 'update',
  ) {
    const now = new Date();

    // quick-fix to not register these three in database...
    Reflect.deleteProperty(identityProviderDto, '_totp');
    Reflect.deleteProperty(identityProviderDto, '_csrf');

    // we don't want to store the fqdns in the provider collection
    Reflect.deleteProperty(identityProviderDto, 'fqdns');

    const clientSecret = this.secretManager.encrypt(
      identityProviderDto.client_secret,
    );

    let createdAt, uid, active, display;
    switch (mode) {
      case 'create':
        uid = uuidv4();
        createdAt = now;
        active = false;
        display = false;
        break;
      case 'update':
        uid = undefined;
        createdAt = undefined;
        active = identityProviderDto.active;
        display = identityProviderDto.display;
        break;
    }

    const entity = {
      uid,
      ...identityProviderDto,
      active,
      display,
      createdAt,
      updatedAt: now,
      updatedBy: username,
      client_secret: clientSecret,
      jwtAlgorithm: [],
      blacklistByIdentityProviderActivated: false,
      whitelistByServiceProviderActivated: false,
      messageToDisplayWhenInactive:
        identityProviderDto.messageToDisplayWhenInactive ||
        'Disponible prochainement',
      specificText:
        identityProviderDto.specificText ||
        'Une erreur est survenue lors de la transmission de votre identité.',
    };

    return this.tranformIntoLegacy(entity);
  }

  private tranformIntoLegacy(
    provider: IIdentityProvider,
  ): IIdentityProviderLegacy {
    const legacyProvider: IIdentityProviderLegacy & IIdentityProvider = {
      ...provider,
      hoverMsg: provider.messageToDisplayWhenInactive,
      hoverRedirectLink: provider.redirectionTargetWhenInactive,
      clientID: provider.clientId,
      authzURL: provider.authorizationUrl,
      statusURL: provider.statusUrl,
      tokenURL: provider.tokenUrl,
      userInfoURL: provider.userInfoUrl,
      endSessionURL: provider.logoutUrl,
      jwksURL: provider.jwksUrl,
      WhitelistByServiceProviderActivated:
        provider.whitelistByServiceProviderActivated,
      mailto: provider.emails.join('\r\n'),
      url: provider.issuer,
      userinfo_encrypted_response_enc: provider.userinfo_encrypted_response_enc,
      userinfo_encrypted_response_alg: provider.userinfo_encrypted_response_alg,
      userinfo_signed_response_alg: provider.userinfo_signed_response_alg,
      id_token_signed_response_alg: provider.id_token_signed_response_alg,
      id_token_encrypted_response_alg: provider.id_token_encrypted_response_alg,
      id_token_encrypted_response_enc: provider.id_token_encrypted_response_enc,
      token_endpoint_auth_method: provider.token_endpoint_auth_method,
    };

    delete legacyProvider.messageToDisplayWhenInactive;
    delete legacyProvider.redirectionTargetWhenInactive;
    delete legacyProvider.clientId;
    delete legacyProvider.authorizationUrl;
    delete legacyProvider.statusUrl;
    delete legacyProvider.tokenUrl;
    delete legacyProvider.userInfoUrl;
    delete legacyProvider.logoutUrl;
    delete legacyProvider.jwksUrl;
    delete legacyProvider.whitelistByServiceProviderActivated;
    delete legacyProvider.emails;
    delete legacyProvider.issuer;
    delete legacyProvider.modalActive;
    delete legacyProvider.modalTitle;
    delete legacyProvider.modalBody;
    delete legacyProvider.modalContinueText;
    delete legacyProvider.modalMoreInfoLabel;
    delete legacyProvider.modalMoreInfoUrl;

    Object.keys(legacyProvider)
      .filter((key) => typeof legacyProvider[key] === 'undefined')
      .map((key) => {
        delete legacyProvider[key];
      });
    return legacyProvider;
  }

  private tranformFromLegacy(
    legacyProvider: IIdentityProviderLegacy,
  ): IIdentityProvider {
    const defaultValues = {
      modal: {
        active: false,
        title: '',
        body: '',
        continueText: '',
        moreInfoLabel: '',
        moreInfoUrl: '',
      },
    };

    const inputProvider = {
      ...defaultValues,
      ...legacyProvider,
    };

    const provider = {
      ...inputProvider,
      messageToDisplayWhenInactive: inputProvider.hoverMsg,
      redirectionTargetWhenInactive: inputProvider.hoverRedirectLink,
      clientId: inputProvider.clientID,
      authorizationUrl: inputProvider.authzURL,
      statusUrl: inputProvider.statusURL,
      tokenUrl: inputProvider.tokenURL,
      userInfoUrl: inputProvider.userInfoURL,
      logoutUrl: inputProvider.endSessionURL,
      jwksUrl: inputProvider.jwksURL,
      whitelistByServiceProviderActivated:
        inputProvider.WhitelistByServiceProviderActivated,
      emails: linesToArray({ value: inputProvider.mailto }),
      issuer: inputProvider.url,
      modalActive: inputProvider.modal.active,
      modalTitle: inputProvider.modal.title,
      modalBody: inputProvider.modal.body,
      modalContinueText: inputProvider.modal.continueText,
      modalMoreInfoLabel: inputProvider.modal.moreInfoLabel,
      modalMoreInfoUrl: inputProvider.modal.moreInfoUrl,
    };

    delete provider.hoverMsg;
    delete provider.hoverRedirectLink;
    delete provider.clientID;
    delete provider.authzURL;
    delete provider.statusURL;
    delete provider.tokenURL;
    delete provider.userInfoURL;
    delete provider.endSessionURL;
    delete provider.jwksURL;
    delete provider.WhitelistByServiceProviderActivated;
    delete provider.mailto;
    delete provider.url;
    delete provider.modal;

    return provider;
  }

  private async addDefaultValuesToDto(
    provider: IdentityProviderDTO,
  ): Promise<IdentityProviderDTO> {
    const { defaultValues } = this.config.get('identity-provider');

    return {
      ...defaultValues,
      ...provider,
    };
  }
}
