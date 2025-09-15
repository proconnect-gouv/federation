import { Repository } from 'typeorm';
import { ConfigService } from 'nestjs-config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { LoggerService } from '../logger/logger.service';
import { IdentityProviderService } from './identity-provider.service';
import { IdentityProviderFromDb } from './identity-provider.mongodb.entity';
import { SecretManagerService } from '../utils/secret-manager.service';
import { ICrudTrack } from '../interfaces';
import { v4 as uuidv4 } from 'uuid';
import { FqdnToProviderService } from '../fqdn-to-provider/fqdn-to-provider.service';
import { PaginationService } from '../pagination';
import { identityProviderFactory } from './fixture';

jest.mock('uuid');

describe('IdentityProviderService', () => {
  let module: TestingModule;
  let identityProviderService: IdentityProviderService;

  const identityProviderRepository = {
    save: jest.fn(),
    insert: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
    findOneByOrFail: jest.fn(),
    delete: jest.fn(),
  };

  const insertResultMock = {
    insertedId: 'insertedIdValueMock',
  };

  const secretManagerMocked = {
    encrypt: jest.fn(),
    generateSHA256: jest.fn(),
  };
  const mockUid = '76eded44d32b40c0cb1006065';

  const encryptedSecret = '**********';
  const objectId = new ObjectId('648c1742c74d6a3d84b31943');

  const configIdentityProviderMock = {
    defaultValues: {},
  };

  const configMock = {
    get: jest.fn(),
  };

  const loggerMock = {
    businessEvent: jest.fn(),
    error: jest.fn(),
  };

  const fqdnToProviderServiceMock = {
    saveFqdnsProvider: jest.fn(),
    updateFqdnsProvider: jest.fn(),
    deleteFqdnsProvider: jest.fn(),
    createFqdnsWithAcceptance: jest.fn(),
  };

  const identityProvidersMock = [
    identityProviderFactory.createIdentityProviderFromDb({
      _id: new ObjectId(),
      name: 'mock-identity-provider-name-1',
      title: 'mock-identity-provider-title-1',
    }),
    identityProviderFactory.createIdentityProviderFromDb({
      _id: new ObjectId(),
      name: 'mock-identity-provider-name-2',
      title: 'mock-identity-provider-title-2',
    }),
  ];
  const mockDate = new Date('1970-01-01');

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [TypeOrmModule.forFeature([IdentityProviderFromDb], 'fc-mongo')],
      providers: [
        IdentityProviderService,
        Repository,
        SecretManagerService,
        ConfigService,
        LoggerService,
        FqdnToProviderService,
        PaginationService,
      ],
    })
      .overrideProvider(getRepositoryToken(IdentityProviderFromDb, 'fc-mongo'))
      .useValue(identityProviderRepository)
      .overrideProvider(SecretManagerService)
      .useValue(secretManagerMocked)
      .overrideProvider(ConfigService)
      .useValue(configMock)
      .overrideProvider(LoggerService)
      .useValue(loggerMock)
      .overrideProvider(FqdnToProviderService)
      .useValue(fqdnToProviderServiceMock)
      .compile();

    identityProviderService = module.get<IdentityProviderService>(
      IdentityProviderService,
    );

    jest.resetAllMocks();

    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

    secretManagerMocked.encrypt.mockReturnValue(encryptedSecret);
    configMock.get.mockResolvedValue(configIdentityProviderMock);
    identityProviderRepository.insert.mockResolvedValue(insertResultMock);
    identityProviderRepository.find.mockResolvedValueOnce(
      identityProvidersMock,
    );
    (uuidv4 as jest.Mock).mockReturnValue(mockUid);
  });

  afterAll(async () => {
    jest.restoreAllMocks();
    module.close();
  });

  describe('getAll', () => {
    it('shoud return the array of all IdentityProviders', async () => {
      // Given
      const expectedResult = [...identityProvidersMock];

      // When
      const result = await identityProviderService.getAll();

      // Then
      expect(result.length).toEqual(2);
      expect(identityProviderRepository.find).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });

    it('shoud throw if repository.find is failling ', async () => {
      // Given
      const errorMessage = 'any error mock';
      const thrownMessage = `Unable to retrieve all identity providers : ${errorMessage}`;

      identityProviderRepository.find
        .mockReset()
        .mockRejectedValueOnce(new Error(errorMessage));

      // When/Then
      await expect(identityProviderService.getAll()).rejects.toThrow(
        thrownMessage,
      );
      expect(loggerMock.error).toHaveBeenCalledTimes(1);
      expect(loggerMock.error).toHaveBeenCalledWith(thrownMessage);
    });
  });

  describe('create', () => {
    const identityProviderDto =
      identityProviderFactory.createIdentityProviderDto({
        name: 'MonFI',
        title: 'Mon FI mieux écrit',
        issuer: 'https://issuer.fr',
        authorizationUrl: 'https://issuer.fr/auth',
        tokenUrl: 'https://issuer.fr/token',
        userInfoUrl: 'https://issuer.fr/userinfo',
        logoutUrl: 'https://issuer.fr/logout',
        statusUrl: 'https://issuer.fr/state',
        jwksUrl: 'https://issuer.fr/discovery',
        discoveryUrl:
          'https://my-discovery-url/.well-known/openid-configuration',
        discovery: true,
        clientId: '09a1a257648c1742c74d6a3d84b31943',
        client_secret: '1234567890AZERTYUIOP',
        messageToDisplayWhenInactive: 'SUPER MESSAGE !!!',
        redirectionTargetWhenInactive: 'https://issuer.fr/promo',
        active: true,
        display: false,
        isBeta: false,
        alt: 'MonFI Image',
        image: 'AliceM.svg',
        imageFocus: 'AliceM.svg',
        eidas: 2,
        allowedAcr: ['eidas2'],
        order: 1,
        emails: ['sherman@kaliop.com', 'vbonnard@kaliopmail.com'],
        specificText:
          "Veuillez fournir une capture d'écran de votre page de profil !",
        amr: ['pop'],
        modalActive: false,
        modalTitle: 'title',
        modalBody: 'body',
        modalContinueText: 'continueText',
        modalMoreInfoLabel: 'moreInfoLabel',
        modalMoreInfoUrl: 'moreInfoUrl',
      });

    const transformedIntoEntity =
      identityProviderFactory.createIdentityProviderFromDb({
        _id: new ObjectId('68a30acf6cb39008b0015ab4'),
        name: 'MonFI',
        mailto: 'authenticationEmail',
        jwtAlgorithm: [],
        createdAt: new Date('1970-01-01T00:00:00.000Z'),
        updatedAt: new Date('1970-01-01T00:00:00.000Z'),
        updatedBy: 'user',
        WhitelistByServiceProviderActivated: false,
        blacklistByIdentityProviderActivated: false,
        hoverMsg: '',
        hoverRedirectLink: '',
        active: true,
        allowedAcr: ['eidas2'],
        alt: 'MonFI Image',
        amr: ['pop'],
        authzURL: 'https://issuer.fr/auth',
        clientID: '09a1a257648c1742c74d6a3d84b31943',
        client_secret: '1234567890AZERTYUIOP',
        discoveryUrl: 'https://default.discovery-url.fr',
        discovery: true,
        display: true,
        eidas: 1,
        image: '',
        imageFocus: '',
        isBeta: false,
        endSessionURL: 'https://issuer.fr/logout',
        url: 'https://default.issuer.fr',
        order: 1,
        specificText:
          'Une erreur est survenue lors de la transmission de votre identité.',
        statusURL: 'https://default.status-url.fr',
        title: 'Mon FI mieux écrit',
        id_token_encrypted_response_alg: 'default_alg',
        id_token_encrypted_response_enc: 'default_enc',
        id_token_signed_response_alg: 'ES256',
        jwksURL: 'https://issuer.fr/discovery',
        siret: '',
        supportEmail: 'support@email.fr',
        token_endpoint_auth_method: 'client_secret_post',
        tokenURL: 'https://issuer.fr/token',
        userinfo_encrypted_response_alg: 'RSA-OAEP',
        userinfo_encrypted_response_enc: 'ES256',
        userinfo_signed_response_alg: 'ES256',
        userInfoURL: 'https://issuer.fr/userinfo',
        uid: 'default_uid',
        modal: {
          active: false,
          body: 'body',
          continueText: 'continueText',
          moreInfoLabel: 'moreInfoLabel',
          moreInfoUrl: 'moreInfoUrl',
          title: 'title',
        },
      });

    beforeEach(() => {
      identityProviderService[
        // tslint:disable-next-line:no-string-literal
        'transformDtoToEntity'
      ] = jest.fn().mockReturnValue(transformedIntoEntity);
      // // tslint:disable-next-line:no-string-literal
      // identityProviderService['tranformIntoLegacy'] = jest
      //   .fn()
      //   .mockReturnValue(transformedIntoLegacy);
      identityProviderRepository.insert = jest
        .fn()
        .mockResolvedValue({ identifiers: [{ _id: objectId }] });

      // tslint:disable-next-line:no-string-literal
      identityProviderService['track'] = jest.fn();
    });

    it('should call transformDtoToEntity', async () => {
      // WHEN
      await identityProviderService.create(identityProviderDto, 'user');

      // THEN
      expect(
        // tslint:disable-next-line:no-string-literal
        identityProviderService['transformDtoToEntity'],
      ).toHaveBeenCalledTimes(1);
      expect(
        // tslint:disable-next-line:no-string-literal
        identityProviderService['transformDtoToEntity'],
      ).toHaveBeenCalledWith(identityProviderDto, 'user', 'create');
    });

    it('should call identityProviderRepository.insert', async () => {
      // WHEN
      await identityProviderService.create(identityProviderDto, 'user');

      // THEN
      expect(identityProviderRepository.insert).toHaveBeenCalledTimes(1);
      expect(identityProviderRepository.insert).toHaveBeenCalledWith(
        transformedIntoEntity,
      );
    });

    it('should call the tracking method of the service', async () => {
      // WHEN
      await identityProviderService.create(identityProviderDto, 'user');

      // THEN
      // tslint:disable-next-line:no-string-literal
      expect(identityProviderService['track']).toHaveBeenCalledTimes(1);
      // tslint:disable-next-line:no-string-literal
      expect(identityProviderService['track']).toHaveBeenCalledWith({
        entity: 'identity-provider',
        action: 'create',
        user: 'user',
        id: objectId,
        name: identityProviderDto.name,
      });
    });

    it('should return saved operation', async () => {
      // WHEN
      const result = await identityProviderService.create(
        identityProviderDto,
        'user',
      );

      // THEN
      expect(result).toEqual(objectId);
    });

    it('should add fqdns when it is AC instance', async () => {
      // GIVEN
      const fqdns = ['stendhal.fr', 'woolf.uk'];
      const identityProviderWithFqdns = { ...identityProviderDto, fqdns };

      fqdnToProviderServiceMock.createFqdnsWithAcceptance.mockReturnValue([
        { acceptsDefaultIdp: true, fqdn: fqdns[0] },
        { acceptsDefaultIdp: true, fqdn: fqdns[1] },
      ]);

      // WHEN
      await identityProviderService.create(identityProviderWithFqdns, 'user');

      // THEN
      expect(fqdnToProviderServiceMock.saveFqdnsProvider).toHaveBeenCalledTimes(
        1,
      );
      // expect(fqdnToProviderServiceMock.saveFqdnsProvider).toHaveBeenCalledWith(
      //   identityProviderWithFqdns.uid,
      //   [
      //     { acceptsDefaultIdp: true, fqdn: fqdns[0] },
      //     { acceptsDefaultIdp: true, fqdn: fqdns[1] },
      //   ],
      // );
    });

    it('should not add fqdns when fqdns are empty when it is AC instance', async () => {
      // GIVEN
      const fqdns = [];
      const identityProviderWithFqdns = { ...identityProviderDto, fqdns };

      // WHEN
      await identityProviderService.create(identityProviderWithFqdns, 'user');

      // THEN
      expect(fqdnToProviderServiceMock.saveFqdnsProvider).toHaveBeenCalledTimes(
        0,
      );
    });
  });

  describe('update()', () => {
    const idMock = objectId.toString();
    const userMock = 'userMockValue';
    const methodMock = 'update';
    const existingIdentityProviderMock =
      identityProviderFactory.createIdentityProviderFromDb({
        _id: objectId,
        uid: 'MonFI',
        name: 'MonFI',
        clientID: 'new-09a1a257648c1742c74d6a3d84b31943',
        client_secret: '1234567890AZERTYUIOP',
      });
    const identityProviderToUpdate =
      identityProviderFactory.createIdentityProviderDto({
        name: 'MonFI',
        clientId: 'new-09a1a257648c1742c74d6a3d84b31943',
        client_secret: '1234567890AZERTYUIOP',
      });

    const transformedIntoEntity =
      identityProviderFactory.createIdentityProviderFromDb({
        _id: objectId,
        uid: 'MonFI',
        name: 'MonFI',

        clientID: 'new-09a1a257648c1742c74d6a3d84b31943',
        client_secret: '1234567890AZERTYUIOP',

        // client_secret: secretManagerMocked,
      });

    beforeEach(() => {
      // tslint:disable-next-line:no-string-literal
      identityProviderService['track'] = jest.fn();
      identityProviderService[
        // tslint:disable-next-line:no-string-literal
        'transformDtoToEntity'
      ] = jest.fn().mockResolvedValue(transformedIntoEntity);
      // // tslint:disable-next-line:no-string-literal
      // identityProviderService['tranformIntoLegacy'] = jest
      //   .fn()
      //   .mockReturnValue(transformedIntoLegacy);
      identityProviderRepository.save.mockResolvedValue(transformedIntoEntity);
      identityProviderRepository.findOneByOrFail.mockResolvedValueOnce(
        existingIdentityProviderMock,
      );
    });

    it('should call the tracking method of the service', async () => {
      // WHEN
      await identityProviderService.update(
        objectId.toString(),
        identityProviderToUpdate,
        userMock,
      );

      // THEN
      // tslint:disable-next-line:no-string-literal
      expect(identityProviderService['track']).toHaveBeenCalledTimes(1);
      // tslint:disable-next-line:no-string-literal
      expect(identityProviderService['track']).toHaveBeenCalledWith({
        entity: 'identity-provider',
        action: 'update',
        user: userMock,
        name: 'MonFI',
        id: objectId.toString(),
      });
    });

    it('should call transformDtoToEntity', async () => {
      // WHEN
      await identityProviderService.update(
        idMock,
        identityProviderToUpdate,
        userMock,
      );

      // THEN
      expect(
        // tslint:disable-next-line:no-string-literal
        identityProviderService['transformDtoToEntity'],
      ).toHaveBeenCalledTimes(1);
      expect(
        // tslint:disable-next-line:no-string-literal
        identityProviderService['transformDtoToEntity'],
      ).toHaveBeenCalledWith(identityProviderToUpdate, userMock, methodMock);
    });

    it('should call identityProviderRepository.findOneAndUpdate', async () => {
      // WHEN
      await identityProviderService.update(
        idMock,
        identityProviderToUpdate,
        userMock,
      );

      // THEN
      expect(identityProviderRepository.save).toHaveBeenCalledTimes(1);
      expect(identityProviderRepository.save).toHaveBeenCalledWith(
        transformedIntoEntity,
      );
    });

    it('should return the updated identityProvider', async () => {
      // WHEN
      const result = await identityProviderService.update(
        idMock,
        identityProviderToUpdate,
        userMock,
      );

      // THEN
      expect(result).toEqual(transformedIntoEntity);
    });

    it('should update fqdns when it is AC instance', async () => {
      // GIVEN
      const uid = 'MonFI';

      const fqdns = ['stendhal.fr', 'woolf.uk'];
      const identityProviderWithFqdns = { ...identityProviderToUpdate, fqdns };
      identityProviderRepository.findOneByOrFail.mockResolvedValueOnce(
        existingIdentityProviderMock,
      );
      identityProviderRepository.save.mockResolvedValueOnce(
        existingIdentityProviderMock,
      );

      // WHEN
      await identityProviderService.update(
        idMock,
        identityProviderWithFqdns,
        userMock,
      );

      // THEN
      expect(
        fqdnToProviderServiceMock.updateFqdnsProvider,
      ).toHaveBeenCalledTimes(1);
      expect(
        fqdnToProviderServiceMock.updateFqdnsProvider,
      ).toHaveBeenCalledWith(uid, fqdns);
    });
  });

  describe('track', () => {
    it('should call logger.businessEvent()', () => {
      // Given
      const argsMock = {} as ICrudTrack;
      // When
      // tslint:disable-next-line:no-string-literal
      identityProviderService['track'](argsMock);
      // Then
      expect(loggerMock.businessEvent).toHaveBeenCalledTimes(1);
      expect(loggerMock.businessEvent).toHaveBeenCalledWith(argsMock);
    });
  });

  describe('should delete identity provider by id', () => {
    beforeEach(() => {
      const identityProviderMock = {
        _id: objectId,
        uid: 'MonFI',
        name: 'MonFI',
      } as unknown as IdentityProviderFromDb;

      identityProviderRepository.findOneByOrFail.mockResolvedValueOnce(
        identityProviderMock,
      );
    });
    it('should call the delete function of the identityProviderRepository with an ID as argument', async () => {
      // set up
      const expectedRepositoryDeleteArguments = { _id: objectId };
      const user = 'mockUsername';
      // action
      await identityProviderService.deleteIdentityProvider(
        objectId.toString(),
        user,
      );
      // assertion
      expect(identityProviderRepository.delete).toHaveBeenCalledTimes(1);
      expect(identityProviderRepository.delete).toHaveBeenCalledWith(
        expectedRepositoryDeleteArguments,
      );
    });

    it('should call the tracking method of the service', async () => {
      // Given
      const user = 'mockUsername';
      // tslint:disable-next-line:no-string-literal
      identityProviderService['track'] = jest.fn();
      // When
      await identityProviderService.deleteIdentityProvider(
        objectId.toString(),
        user,
      );
      // Then
      // tslint:disable-next-line:no-string-literal
      expect(identityProviderService['track']).toHaveBeenCalledTimes(1);
      // tslint:disable-next-line:no-string-literal
      expect(identityProviderService['track']).toHaveBeenCalledWith({
        entity: 'identity-provider',
        action: 'delete',
        name: 'MonFI',
        user,
        id: objectId.toString(),
      });
    });

    it('should delete fqdns when it is AC instance', async () => {
      // GIVEN
      const uid = 'MonFI';
      const identityProviderMock = {
        _id: objectId,
        uid,
        name: 'MonFI',
      } as unknown as IdentityProviderFromDb;

      identityProviderRepository.findOneByOrFail.mockResolvedValueOnce(
        identityProviderMock,
      );

      // WHEN
      await identityProviderService.deleteIdentityProvider(
        identityProviderMock._id.toHexString(),
        'user',
      );

      // THEN
      expect(
        fqdnToProviderServiceMock.deleteFqdnsProvider,
      ).toHaveBeenCalledTimes(1);
      expect(
        fqdnToProviderServiceMock.deleteFqdnsProvider,
      ).toHaveBeenCalledWith(uid);
    });
  });

  describe('transformDtoToEntity', () => {
    const identityProviderDto =
      identityProviderFactory.createIdentityProviderDto({
        name: 'MonFI',
        title: 'Mon FI mieux écrit',
        issuer: 'https://issuer.fr',
        authorizationUrl: 'https://issuer.fr/auth',
        tokenUrl: 'https://issuer.fr/token',
        userInfoUrl: 'https://issuer.fr/userinfo',
        logoutUrl: 'https://issuer.fr/logout',
        statusUrl: 'https://default.status-url.fr',
        jwksUrl: 'https://issuer.fr/discovery',
        discovery: true,
        clientId: '09a1a257648c1742c74d6a3d84b31943',
        client_secret: '1234567890AZERTYUIOP',
        messageToDisplayWhenInactive: 'SUPER MESSAGE !!!',
        redirectionTargetWhenInactive: 'https://issuer.fr/promo',
        active: true,
        display: true,
        isBeta: false,
        alt: 'MonFI Image',
        image: 'AliceM.svg',
        imageFocus: 'AliceM.svg',
        eidas: 2,
        allowedAcr: ['eidas2'],
        order: 1,
        emails: ['sherman@kaliop.com', 'vbonnard@kaliopmail.com'],
        specificText:
          'Une erreur est survenue lors de la transmission de votre identité.',

        amr: ['pop'],
        discoveryUrl: 'https://default.discovery-url.fr',
        id_token_encrypted_response_alg: 'default_alg',
        id_token_encrypted_response_enc: 'default_enc',
        id_token_signed_response_alg: 'ES256',
        siret: '',
        supportEmail: 'support@email.fr',
        token_endpoint_auth_method: 'client_secret_post',

        userinfo_encrypted_response_alg: 'RSA-OAEP',
        userinfo_encrypted_response_enc: 'ES256',
        userinfo_signed_response_alg: 'ES256',
      });

    const transformedIntoEntity =
      identityProviderFactory.createIdentityProviderFromDb({
        _id: new ObjectId('68a30acf6cb39008b0015ab4'),
        uid: mockUid,
        name: 'MonFI',
        mailto: 'sherman@kaliop.com\r\nvbonnard@kaliopmail.com',
        jwtAlgorithm: [],
        createdAt: mockDate,
        updatedAt: mockDate,
        updatedBy: 'user',
        WhitelistByServiceProviderActivated: false,
        blacklistByIdentityProviderActivated: false,
        hoverMsg: 'SUPER MESSAGE !!!',
        hoverRedirectLink: 'https://issuer.fr/promo',
        active: false,
        allowedAcr: ['eidas2'],
        alt: 'MonFI Image',
        amr: ['pop'],
        authzURL: 'https://issuer.fr/auth',
        clientID: '09a1a257648c1742c74d6a3d84b31943',
        client_secret: encryptedSecret,
        discoveryUrl: 'https://default.discovery-url.fr',
        discovery: true,
        display: false,
        eidas: 2,
        image: 'AliceM.svg',
        imageFocus: 'AliceM.svg',
        isBeta: false,
        endSessionURL: 'https://issuer.fr/logout',
        url: 'https://issuer.fr',
        order: 1,
        specificText:
          'Une erreur est survenue lors de la transmission de votre identité.',
        statusURL: 'https://default.status-url.fr',
        title: 'Mon FI mieux écrit',
        id_token_encrypted_response_alg: 'default_alg',
        id_token_encrypted_response_enc: 'default_enc',
        id_token_signed_response_alg: 'ES256',
        jwksURL: 'https://issuer.fr/discovery',
        siret: '',
        supportEmail: 'support@email.fr',
        token_endpoint_auth_method: 'client_secret_post',
        tokenURL: 'https://issuer.fr/token',
        userinfo_encrypted_response_alg: 'RSA-OAEP',
        userinfo_encrypted_response_enc: 'ES256',
        userinfo_signed_response_alg: 'ES256',
        userInfoURL: 'https://issuer.fr/userinfo',
      });

    it('should call encrypt', async () => {
      // WHEN
      // tslint:disable-next-line:no-string-literal
      identityProviderService['transformDtoToEntity'](
        identityProviderDto,
        'user',
        'create',
      );

      // THEN
      expect(secretManagerMocked.encrypt).toHaveBeenCalledTimes(1);
      expect(secretManagerMocked.encrypt).toHaveBeenCalledWith(
        identityProviderDto.client_secret,
      );
    });

    it('should return a transform identity provider', async () => {
      // WHEN
      // tslint:disable-next-line:no-string-literal
      const result = identityProviderService['transformDtoToEntity'](
        identityProviderDto,
        'user',
        'create',
      );

      const { _id, ...transformedEntityWithoutId } = transformedIntoEntity;

      // THEN
      expect(result).toEqual(transformedEntityWithoutId);
    });
  });
});
