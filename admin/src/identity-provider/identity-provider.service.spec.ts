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
        active: true,
        fqdns: ['my-fqdn.fr'],
      });

    const transformedIntoEntity =
      identityProviderFactory.createIdentityProviderFromDb({
        _id: new ObjectId('68a30acf6cb39008b0015ab4'),
        name: 'MonFI',
        createdAt: new Date('1970-01-01T00:00:00.000Z'),
        updatedAt: new Date('1970-01-01T00:00:00.000Z'),
        updatedBy: 'user',
        active: true,
        authzURL: 'https://issuer.fr/auth',
        clientID: '09a1a257648c1742c74d6a3d84b31943',
        client_secret: '1234567890AZERTYUIOP',
        discoveryUrl: 'https://default.discovery-url.fr',
        discovery: true,
        endSessionURL: 'https://issuer.fr/logout',
        url: 'https://default.issuer.fr',
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
        fqdns: ['my-fqdn.fr'],
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
      identityProviderService['track'] = jest.fn();
      identityProviderService['transformDtoToEntity'] = jest
        .fn()
        .mockResolvedValue(transformedIntoEntity);

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
      expect(identityProviderService['track']).toHaveBeenCalledTimes(1);
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
        identityProviderService['transformDtoToEntity'],
      ).toHaveBeenCalledTimes(1);
      expect(
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
  });

  describe('track', () => {
    it('should call logger.businessEvent()', () => {
      // Given
      const argsMock = {} as ICrudTrack;
      // When
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
      identityProviderService['track'] = jest.fn();
      // When
      await identityProviderService.deleteIdentityProvider(
        objectId.toString(),
        user,
      );
      // Then
      expect(identityProviderService['track']).toHaveBeenCalledTimes(1);
      expect(identityProviderService['track']).toHaveBeenCalledWith({
        entity: 'identity-provider',
        action: 'delete',
        name: 'MonFI',
        user,
        id: objectId.toString(),
      });
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
        active: true,
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
        createdAt: mockDate,
        updatedAt: mockDate,
        updatedBy: 'user',
        active: true,
        authzURL: 'https://issuer.fr/auth',
        clientID: '09a1a257648c1742c74d6a3d84b31943',
        client_secret: encryptedSecret,
        discoveryUrl: 'https://default.discovery-url.fr',
        discovery: true,
        endSessionURL: 'https://issuer.fr/logout',
        url: 'https://issuer.fr',
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
