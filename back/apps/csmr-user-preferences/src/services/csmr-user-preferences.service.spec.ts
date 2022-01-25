import { Test, TestingModule } from '@nestjs/testing';

import { Account, AccountNotFoundException, AccountService } from '@fc/account';
import { CryptographyFcpService, IPivotIdentity } from '@fc/cryptography-fcp';
import { IdentityProviderAdapterMongoService } from '@fc/identity-provider-adapter-mongo';
import { LoggerService } from '@fc/logger';
import { IdentityProviderMetadata } from '@fc/oidc';

import { CsmrUserPreferencesIdpNotFoundException } from '../exceptions';
import { CsmrUserPreferencesService } from './csmr-user-preferences.service';

describe('CsmrUserPreferencesService', () => {
  let service: CsmrUserPreferencesService;

  const identityMock = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    given_name: 'Jean Paul Henri',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    family_name: 'Dupont',
    gender: 'male',
    birthdate: '1970-01-01',
    birthplace: '95277',
    birthcountry: '99100',
  } as IPivotIdentity;
  const identityHashMock = 'identityHashMockValue';
  const accountMock: Account = {
    id: '42',
    idpSettings: {
      updatedAt: new Date(),
      includeList: ['bar'],
    },
  } as Account;
  const includeListMock = ['bar'];
  const identityProviderMetadataMock = [
    {
      uid: 'foo',
      title: 'foo Title',
      name: 'Foo',
      image: 'foo.png',
      display: true,
      active: true,
      discovery: true,
      discoveryUrl:
        'https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/.well-known/openid-configuration',
      issuer: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        jwks_uri: 'https://fsp1v2.docker.dev-franceconnect.fr/jwks_uri',
      },
    },
    {
      uid: 'bar',
      title: 'bar Title',
      name: 'Bar',
      image: 'bar.png',
      display: true,
      active: true,
      discovery: true,
      discoveryUrl:
        'https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/.well-known/openid-configuration',
      issuer: {
        // oidc param name
        // eslint-disable-next-line @typescript-eslint/naming-convention
        jwks_uri: 'https://fsp1v2.docker.dev-franceconnect.fr/jwks_uri',
      },
    },
  ] as IdentityProviderMetadata[];
  const formatUserIdpSettingsListResultMock = [
    {
      uid: 'foo',
      title: 'foo Title',
      name: 'Foo',
      image: 'foo.png',
      active: true,
      isChecked: false,
    },
    {
      uid: 'bar',
      title: 'bar Title',
      name: 'Bar',
      image: 'bar.png',
      active: true,
      isChecked: true,
    },
  ];
  const updatedAccount = {
    ...accountMock,
    idpSettings: { updatedAt: Date.now(), includeList: includeListMock },
  };

  const loggerServiceMock = {
    setContext: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
  } as unknown as LoggerService;

  const accountServiceMock = {
    getAccountByIdentityHash: jest.fn(),
    updateIdpSettings: jest.fn(),
  };

  const cryptographyFcpServiceMock = {
    computeIdentityHash: jest.fn(),
  };

  const identityProviderServiceMock = {
    getList: jest.fn(),
  };

  const formatUserIdpSettingsListMock = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CsmrUserPreferencesService],
      providers: [
        LoggerService,
        AccountService,
        CryptographyFcpService,
        IdentityProviderAdapterMongoService,
      ],
    })
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .overrideProvider(AccountService)
      .useValue(accountServiceMock)
      .overrideProvider(CryptographyFcpService)
      .useValue(cryptographyFcpServiceMock)
      .overrideProvider(IdentityProviderAdapterMongoService)
      .useValue(identityProviderServiceMock)
      .compile();

    service = module.get<CsmrUserPreferencesService>(
      CsmrUserPreferencesService,
    );
  });

  describe('formatUserIdpSettingsList', () => {
    it('should return a formatted identity provider list with isCheck field', () => {
      // Given
      const includeList = ['foo'];

      // When
      const idpSettingsList = service.formatUserIdpSettingsList(
        identityProviderMetadataMock,
        includeList,
      );

      // Then
      expect(idpSettingsList).toEqual([
        {
          uid: 'foo',
          title: 'foo Title',
          name: 'Foo',
          image: 'foo.png',
          active: true,
          isChecked: true,
        },
        {
          uid: 'bar',
          title: 'bar Title',
          name: 'Bar',
          image: 'bar.png',
          active: true,
          isChecked: false,
        },
      ]);
    });

    it('should filter idp we should not display', () => {
      // Given
      const includeList = ['foo'];
      const metadataMock = [
        ...identityProviderMetadataMock,
        {
          uid: 'foo',
          title: 'foo Title',
          name: 'Foo',
          image: 'foo.png',
          display: false,
          active: true,
          discovery: true,
        },
      ] as IdentityProviderMetadata[];

      // When
      const idpSettingsList = service.formatUserIdpSettingsList(
        metadataMock,
        includeList,
      );

      // Then
      expect(idpSettingsList).toEqual([
        {
          uid: 'foo',
          title: 'foo Title',
          name: 'Foo',
          image: 'foo.png',
          active: true,
          isChecked: true,
        },
        {
          uid: 'bar',
          title: 'bar Title',
          name: 'Bar',
          image: 'bar.png',
          active: true,
          isChecked: false,
        },
      ]);
    });

    it('should return an identity provider list with isCheck set to true if includeList is empty', () => {
      // Given
      const includeList = [];

      // When
      const idpSettingsList = service.formatUserIdpSettingsList(
        identityProviderMetadataMock,
        includeList,
      );

      // Then
      expect(idpSettingsList).toEqual([
        {
          uid: 'foo',
          title: 'foo Title',
          name: 'Foo',
          image: 'foo.png',
          active: true,
          isChecked: true,
        },
        {
          uid: 'bar',
          title: 'bar Title',
          name: 'Bar',
          image: 'bar.png',
          active: true,
          isChecked: true,
        },
      ]);
    });

    it('should return an identity provider list with isCheck set to true if includeList is not defined', () => {
      // Given
      const includeList = undefined;

      // When
      const idpSettingsList = service.formatUserIdpSettingsList(
        identityProviderMetadataMock,
        includeList,
      );

      // Then
      expect(idpSettingsList).toEqual([
        {
          uid: 'foo',
          title: 'foo Title',
          name: 'Foo',
          image: 'foo.png',
          active: true,
          isChecked: true,
        },
        {
          uid: 'bar',
          title: 'bar Title',
          name: 'Bar',
          image: 'bar.png',
          active: true,
          isChecked: true,
        },
      ]);
    });
  });

  describe('getIdpSettings()', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      jest.restoreAllMocks();

      cryptographyFcpServiceMock.computeIdentityHash.mockReturnValueOnce(
        identityHashMock,
      );
      accountServiceMock.getAccountByIdentityHash.mockResolvedValueOnce(
        accountMock,
      );
      identityProviderServiceMock.getList.mockResolvedValueOnce(
        identityProviderMetadataMock,
      );
      service.formatUserIdpSettingsList =
        formatUserIdpSettingsListMock.mockReturnValueOnce(
          formatUserIdpSettingsListResultMock,
        );
    });

    it('Should return identity provider metadatas data', async () => {
      // When
      const idpSettings = await service.getIdpSettings(identityMock);
      // Then
      expect(idpSettings).toEqual(formatUserIdpSettingsListResultMock);
    });

    it('Should compute the identityHash from the identity', async () => {
      // Given / When
      await service.getIdpSettings(identityMock);
      // Then
      expect(
        cryptographyFcpServiceMock.computeIdentityHash,
      ).toHaveBeenCalledWith(identityMock);
      expect(
        cryptographyFcpServiceMock.computeIdentityHash,
      ).toHaveBeenCalledTimes(1);
    });

    it('Should get an Account object from an identityHash', async () => {
      // Given / When
      await service.getIdpSettings(identityMock);
      // When
      expect(accountServiceMock.getAccountByIdentityHash).toHaveBeenCalledWith(
        identityHashMock,
      );
      expect(accountServiceMock.getAccountByIdentityHash).toHaveBeenCalledTimes(
        1,
      );
    });

    it('Should throw an error `AccountNotFoundException` if no account found for an `identityHash`', async () => {
      // Given
      const accountEmptyMock = { id: null };
      const noAccountMock = new AccountNotFoundException();
      accountServiceMock.getAccountByIdentityHash
        .mockReset()
        .mockResolvedValueOnce(accountEmptyMock);
      // When / Then
      await expect(service.getIdpSettings(identityMock)).rejects.toThrow(
        noAccountMock,
      );
    });

    it('should get the list of identity provider metadata', async () => {
      // Given / When
      await service.getIdpSettings(identityMock);
      // Then
      expect(identityProviderServiceMock.getList).toHaveBeenCalledTimes(1);
    });

    it('should format metadata in order to clean data and add a "isCheck" property', async () => {
      // Given / When
      await service.getIdpSettings(identityMock);
      // Then
      expect(formatUserIdpSettingsListMock).toHaveBeenCalledTimes(1);
      expect(formatUserIdpSettingsListMock).toHaveBeenCalledWith(
        identityProviderMetadataMock,
        accountMock.idpSettings.includeList,
      );
    });
  });

  describe('setIdpSettings()', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      jest.restoreAllMocks();

      cryptographyFcpServiceMock.computeIdentityHash.mockReturnValueOnce(
        identityHashMock,
      );
      accountServiceMock.updateIdpSettings.mockResolvedValueOnce(
        updatedAccount,
      );
      identityProviderServiceMock.getList.mockResolvedValueOnce(
        identityProviderMetadataMock,
      );
      service.formatUserIdpSettingsList =
        formatUserIdpSettingsListMock.mockReturnValueOnce(
          formatUserIdpSettingsListResultMock,
        );
    });

    it('Should return identity provider metadata with updated data', async () => {
      // Given / When
      const updatedIdpSettings = await service.setIdpSettings(
        identityMock,
        includeListMock,
      );
      // Then
      expect(updatedIdpSettings).toEqual(formatUserIdpSettingsListResultMock);
    });

    it('Should get the metadata idp list', async () => {
      // Given / When
      await service.setIdpSettings(identityMock, includeListMock);
      // Then
      expect(identityProviderServiceMock.getList).toHaveBeenCalledTimes(1);
    });

    it('Should compute the identityHash from the identity', async () => {
      // Given / When
      await service.setIdpSettings(identityMock, includeListMock);
      // Then
      expect(
        cryptographyFcpServiceMock.computeIdentityHash,
      ).toHaveBeenCalledWith(identityMock);
      expect(
        cryptographyFcpServiceMock.computeIdentityHash,
      ).toHaveBeenCalledTimes(1);
    });

    it('should throw CsmrUserPreferencesIdpNotFoundException if identity provider in parameter is not found in listing', async () => {
      // Given
      const includeList = ['idp_not_exists'];
      const idpNotFoundMock = new CsmrUserPreferencesIdpNotFoundException();
      // When
      await expect(
        service.setIdpSettings(identityMock, includeList),
      ).rejects.toThrow(idpNotFoundMock);
    });

    it('Should update account from identity hash and an idpList and get the updated account', async () => {
      // Given / When
      await service.setIdpSettings(identityMock, includeListMock);
      // Then
      expect(accountServiceMock.updateIdpSettings).toBeCalledWith(
        identityHashMock,
        includeListMock,
      );
      expect(accountServiceMock.updateIdpSettings).toHaveBeenCalledTimes(1);
    });

    it('Should throw an error `AccountNotFoundException` if no account found for an `identityHash`', async () => {
      // Given
      const accountEmptyMock = { id: null };
      const noAccountMock = new AccountNotFoundException();
      accountServiceMock.updateIdpSettings
        .mockReset()
        .mockResolvedValueOnce(accountEmptyMock);
      // When / Then
      await expect(
        service.setIdpSettings(identityMock, includeListMock),
      ).rejects.toThrow(noAccountMock);
    });

    it('should format metadata in order to clean data and add a "isCheck" property', async () => {
      // Given / When
      await service.setIdpSettings(identityMock, includeListMock);
      // Then
      expect(formatUserIdpSettingsListMock).toHaveBeenCalledTimes(1);
      expect(formatUserIdpSettingsListMock).toHaveBeenCalledWith(
        identityProviderMetadataMock,
        includeListMock,
      );
    });
  });
});
