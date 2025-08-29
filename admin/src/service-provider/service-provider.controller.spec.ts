import { ObjectId } from 'mongodb';

import { Test } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';

import {
  IdentityProviderService,
  identityProviderFactory,
} from '../identity-provider';
import { ScopesService } from '../scopes';
import { claimsListMock, ClaimsService } from '../claims';

import { ServiceProviderController } from './service-provider.controller';
import { ServiceProvider } from './service-provider.mongodb.entity';
import { ServiceProviderService } from './service-provider.service';

const id: ObjectId = new ObjectId('5d9c677da8bb151b00720451');

const scopeList = ['openid', 'given_name', 'family_name', 'email'];

describe('ServiceProviderController', () => {
  let serviceProviderController: ServiceProviderController;
  let service: ServiceProviderService;

  const serviceProviderRepository = {
    countBy: jest.fn(),
  };

  const serviceProviderServiceMock = {
    createServiceProvider: jest.fn(),
    paginate: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    deleteManyServiceProvidersById: jest.fn(),
    deleteServiceProviderById: jest.fn(),
    generateNewSecret: jest.fn(),
  };

  const renderMock = {
    render: jest.fn(),
  };

  const res = {
    redirect: jest.fn(),
    status: jest.fn(),
    locals: {
      APP_ROOT: '/foo/bar',
    },
  };

  const ServiceProviderDtoMock = {
    name: 'monfs',
    redirectUri: [
      'https://url.com',
      'fc+app01://openid_redirect_url',
      'FC-app.02://openid_redirect_url',
      'franceconnect://openid_redirect_url',
    ],
    redirectUriLogout: [
      'https://url.com',
      'fc+app01://openid_redirect_url',
      'FC-app.02://openid_redirect_url',
      'franceconnect://openid_redirect_url',
    ],
    site: ['https://monsite.com'],
    emails: ['v@b.com'],
    ipAddresses: ['192.0.0.0'],
    active: true,
    type: 'public',
    scopes: [...scopeList],
    claims: ['amr'],
    trustedIdentity: false,
  };

  const idParam = '05e4fadf-fda6-4ad8-ae75-b7f315843827';

  const req = {
    flash: jest.fn(),
    params: { id: idParam },
    session: {},
    user: { id: idParam, username: 'mocker' },
    csrfToken: () => 'mygreatcsrftoken',
  };

  const scopesServiceMock = {
    getAll: jest.fn(),
    getScopesGroupedByFd: jest.fn(),
  };

  const claimsServiceMock = {
    getAll: jest.fn(),
  };

  const identityProviderServiceMock = {
    getAll: jest.fn(),
  };

  const scopesGroupMock = {
    'Direction générale des Finances publiques': [
      {
        fd: 'typeMockValue',
        scope: 'scopeMockValue',
        label: 'labelMockValue',
      },
    ],
    "Caisse nationale de l'assurance maladie": [
      {
        fd: 'typeMockValue',
        scope: 'scopeMockValue',
        label: 'labelMockValue',
      },
    ],
  };

  const userMock = 'toto';

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [TypeOrmModule.forFeature([ServiceProvider], 'fc-mongo')],
      providers: [
        ServiceProviderController,
        ServiceProviderService,
        ScopesService,
        ClaimsService,
        IdentityProviderService,
      ],
    })
      .overrideProvider(getRepositoryToken(ServiceProvider, 'fc-mongo'))
      .useValue(serviceProviderRepository)
      .overrideProvider(ServiceProviderService)
      .useValue(serviceProviderServiceMock)
      .overrideProvider(ScopesService)
      .useValue(scopesServiceMock)
      .overrideProvider(ClaimsService)
      .useValue(claimsServiceMock)
      .overrideProvider(IdentityProviderService)
      .useValue(identityProviderServiceMock)
      .compile();

    serviceProviderController = await module.get<ServiceProviderController>(
      ServiceProviderController,
    );

    service = await module.get<ServiceProviderService>(ServiceProviderService);

    jest.resetAllMocks();

    renderMock.render.mockReturnValueOnce(true);
    res.status.mockReturnValueOnce(renderMock);
    const identityProvidersMock = [
      identityProviderFactory.createIdentityProviderFromDb({}),
      identityProviderFactory.createIdentityProviderFromDb({}),
    ];
    identityProviderServiceMock.getAll.mockResolvedValue(identityProvidersMock);
  });

  describe('list()', () => {
    it('returns the list of the available service providers', async () => {
      // Setup
      const search = undefined;
      const sortField = undefined;
      const sortDirection = undefined;
      const page = '0';
      const limit = '10';

      // Mocking item id
      const itemId: ObjectId = new ObjectId('5d35b91e70332098440d0f85');

      // Mocking Items
      const itemTest1: ServiceProvider = {
        _id: itemId,
        name: 'Site Usagers',
        redirect_uris: ['https://url.com'],
        post_logout_redirect_uris: [''],
        jwks_uri: 'https://monfs.com/jwks',
        site: ['https://monsite.com'],
        email: 'v@b.com',
        IPServerAddressesAndRanges: ['192.0.0.0'],
        active: true,
        type: 'public',
        secretCreatedAt: new Date(),
        client_secret: '76eded44d32b40c0cb1006065',
        key: '6925fb8143c76eded44d32b40c0cb1006065f7f003de52712b78985704f39950',
        createdAt: new Date(),
        updatedBy: userMock,
        scopes: [...scopeList],
        trustedIdentity: false,
        entityId:
          'a0cd64372db6ecf39c317c0c74ce90f02d8ad7d510ce054883b759d666a996bc',
      };

      const itemTest2: ServiceProvider = {
        _id: itemId,
        name: 'Site Usagers',
        redirect_uris: ['https://url.com'],
        post_logout_redirect_uris: [''],
        jwks_uri: 'https://monfs.com/jwks',
        site: ['https://monsite.com'],
        email: 'v@b.com',
        IPServerAddressesAndRanges: ['192.0.0.0'],
        active: true,
        type: 'public',
        secretCreatedAt: new Date(),
        client_secret: '76eded44d32b40c0cb1006065',
        key: '6925fb8143c76eded44d32b40c0cb1006065f7f003de52712b78985704f39950',
        createdAt: new Date(),
        updatedBy: userMock,
        scopes: [...scopeList],
        trustedIdentity: false,
        eidas: 1,
        entityId:
          'a0cd64372db6ecf39c317c0c74ce90f02d8ad7d510ce054883b759d666a996bc',
      };

      const itemTest3: ServiceProvider = {
        _id: itemId,
        name: 'Site Usagers',
        redirect_uris: ['https://url.com'],
        post_logout_redirect_uris: [''],
        jwks_uri: 'https://monfs.com/jwks',
        site: ['https://monsite.com'],
        email: 'v@b.com',
        IPServerAddressesAndRanges: ['192.0.0.0'],
        active: true,
        type: 'public',
        secretCreatedAt: new Date(),
        client_secret: '76eded44d32b40c0cb1006065',
        key: '6925fb8143c76eded44d32b40c0cb1006065f7f003de52712b78985704f39950',
        createdAt: new Date(),
        updatedBy: userMock,
        scopes: [...scopeList],
        trustedIdentity: false,
        userinfo_signed_response_alg: 'ES256',
        id_token_signed_response_alg: 'ES256',
        entityId:
          'a0cd64372db6ecf39c317c0c74ce90f02d8ad7d510ce054883b759d666a996bc',
      };

      // Mocking return value of serviceProviderController.list(page, limit)
      const serviceProvidersResult = {
        items: [itemTest1, itemTest2, itemTest3],
        itemCount: 3,
        total: 3,
        pageCount: 0,
        next: '',
        previous: '',
      };

      // Actions

      // Mocking the return of the paginate function
      const paginated = Promise.resolve(serviceProvidersResult);

      jest
        .spyOn(service, 'paginate')
        .mockImplementation(() => Promise.resolve(paginated));

      // Calling the list function
      const spList = await serviceProviderController.list(
        req,
        search,
        sortField,
        sortDirection,
        page,
        limit,
      );

      // Expected
      expect(spList.serviceProviders.length).toEqual(3);
    });

    it('call repository with active true', async () => {
      const search = undefined;
      const sortField = undefined;
      const sortDirection = undefined;
      const page = '0';
      const limit = '10';

      // Mocking item id
      const itemId: ObjectId = new ObjectId('5d35b91e70332098440d0f85');

      // Mocking Items
      const itemTest1: ServiceProvider = {
        _id: itemId,
        name: 'Site Usagers',
        signup_id: '123456',
        redirect_uris: ['https://url.com'],
        post_logout_redirect_uris: [''],
        jwks_uri: 'https://monfs.com/jwks',
        site: ['https://monsite.com'],
        email: 'v@b.com',
        IPServerAddressesAndRanges: ['192.0.0.0'],
        active: true,
        type: 'public',
        secretCreatedAt: new Date(),
        client_secret: '76eded44d32b40c0cb1006065',
        key: '6925fb8143c76eded44d32b40c0cb1006065f7f003de52712b78985704f39950',
        createdAt: new Date(),
        updatedBy: userMock,
        scopes: [...scopeList],
        identityConsent: false,
        trustedIdentity: false,
        eidas: 1,
        entityId:
          'a0cd64372db6ecf39c317c0c74ce90f02d8ad7d510ce054883b759d666a996bc',
      };

      const itemTest2: ServiceProvider = {
        _id: itemId,
        name: 'Site Usagers',
        signup_id: '123456',
        redirect_uris: ['https://url.com'],
        jwks_uri: 'https://monfs.com/jwks',
        post_logout_redirect_uris: [''],
        site: ['https://monsite.com'],
        email: 'v@b.com',
        IPServerAddressesAndRanges: ['192.0.0.0'],
        active: true,
        type: 'public',
        secretCreatedAt: new Date(),
        client_secret: '76eded44d32b40c0cb1006065',
        key: '6925fb8143c76eded44d32b40c0cb1006065f7f003de52712b78985704f39950',
        createdAt: new Date(),
        updatedBy: userMock,
        scopes: [...scopeList],
        identityConsent: false,
        trustedIdentity: false,
        eidas: 1,
        entityId:
          'a0cd64372db6ecf39c317c0c74ce90f02d8ad7d510ce054883b759d666a996bc',
      };

      const itemTest3: ServiceProvider = {
        _id: itemId,
        name: 'Site Usagers',
        signup_id: '123456',
        redirect_uris: ['https://url.com'],
        jwks_uri: 'https://monfs.com/jwks',
        post_logout_redirect_uris: [''],
        site: ['https://monsite.com'],
        email: 'v@b.com',
        IPServerAddressesAndRanges: ['192.0.0.0'],
        active: true,
        type: 'public',
        secretCreatedAt: new Date(),
        client_secret: '76eded44d32b40c0cb1006065',
        key: '6925fb8143c76eded44d32b40c0cb1006065f7f003de52712b78985704f39950',
        createdAt: new Date(),
        updatedBy: userMock,
        scopes: [...scopeList],
        identityConsent: false,
        trustedIdentity: false,
        eidas: 1,
        entityId:
          'a0cd64372db6ecf39c317c0c74ce90f02d8ad7d510ce054883b759d666a996bc',
      };

      // Mocking return value of serviceProviderController.list(page, limit)
      const serviceProvidersResult = {
        items: [itemTest1, itemTest2, itemTest3],
        total: 3,
      };

      const result = Promise.resolve(serviceProvidersResult);

      jest
        .spyOn(service, 'paginate')
        .mockImplementation(() => Promise.resolve(result));

      await serviceProviderController.list(
        req,
        search,
        sortField,
        sortDirection,
        page,
        limit,
      );

      expect(serviceProviderRepository.countBy).toHaveBeenCalledWith({
        active: true,
      });
    });
  });

  describe('createServiceProvider()', () => {
    it('should call correct params when creating a service provider', async () => {
      // when
      await serviceProviderController.createServiceProvider(
        ServiceProviderDtoMock,
        req,
        res,
      );

      // then
      const { createServiceProvider } = serviceProviderServiceMock;
      expect(createServiceProvider).toHaveBeenCalledTimes(1);
      expect(createServiceProvider).toHaveBeenNthCalledWith(
        1,
        {
          ...ServiceProviderDtoMock,
        },
        req.user.username,
      );
    });
  });

  describe('showCreationForm()', () => {
    beforeEach(() => {
      claimsServiceMock.getAll.mockResolvedValue(claimsListMock);
      scopesServiceMock.getScopesGroupedByFd.mockResolvedValue(scopesGroupMock);
    });

    it('Should get service provider creation and render view', async () => {
      // when
      const result = await serviceProviderController.showCreationForm(req);

      // then
      expect(result).toEqual({
        csrfToken: 'mygreatcsrftoken',
        claims: [
          {
            name: 'amr',
            id,
          },
        ],
        claimsSelected: ['amr'],
        scopesGroupedByFd: scopesGroupMock,
      });
    });

    it('Should call IdentityProviderService.getAll and return the fixture array', async () => {
      // when
      const result = await serviceProviderController.showCreationForm(req);

      // then
      expect(result).toEqual({
        csrfToken: expect.any(String),
        claims: expect.any(Array),
        claimsSelected: ['amr'],
        scopesGroupedByFd: scopesGroupMock,
      });
    });
  });

  describe('findOne(), get a service provider', () => {
    const serviceProvider = {
      id: idParam,
      name: 'ProConnect TEST find one',
      redirect_uris: ['https://proconnect.gouv.fr'],
      post_logout_redirect_uris: ['https://proconnect.gouv.fr'],
      site: ['https://proconnect.gouv.fr'],
      status: 'public',
      jwks_uri: 'https://proconnect.gouv.fr/jwks',
      active: 'true',
      IPServerAddressesAndRanges: ['1.1.1.1'],
      key: 'cb55015c-7fb5-49b4-9006-e523552bc3e7',
      scopes: [...scopeList],
      trustedIdentity: false,
      grant_types: 'default',
      response_types: 'default',
    };

    it('should get a service Provider and render update view', async () => {
      // setup
      const spMock = {
        ...serviceProvider,
        email: ['v@b.com'],
      };
      claimsServiceMock.getAll.mockResolvedValue(claimsListMock);

      serviceProviderServiceMock.findById.mockImplementation(() =>
        Promise.resolve(spMock),
      );

      scopesServiceMock.getScopesGroupedByFd.mockResolvedValue(scopesGroupMock);

      // action
      const result = await serviceProviderController.findOne(idParam, req);

      // expect
      expect(req.flash).toHaveBeenCalledTimes(1);
      expect(req.flash).toHaveBeenCalledWith('values', {
        ...spMock,
        redirectUri: 'https://proconnect.gouv.fr',
        ipsRanges: '1.1.1.1',
        postLogoutUri: 'https://proconnect.gouv.fr',
        emails: 'v@b.com',
        site: 'https://proconnect.gouv.fr',
        userinfo_signed_response_alg: '',
      });
      expect(result).toEqual({
        id: idParam,
        csrfToken: 'mygreatcsrftoken',
        scopesGroupedByFd: scopesGroupMock,
        scopesSelected: scopeList,
        claimsSelected: ['amr'],
        claims: [
          {
            name: 'amr',
            id,
          },
        ],
      });
    });
  });

  describe('serviceProviderUpdate()', () => {
    it('should update a servicerProvider and return to the serviceProvider page', async () => {
      await serviceProviderController.serviceProviderUpdate(
        ServiceProviderDtoMock,
        idParam,
        req,
        res,
      );
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith(
        `${res.locals.APP_ROOT}/service-provider/${idParam}`,
      );
    });

    it('should call serviceProviderService.update()', async () => {
      // When
      await serviceProviderController.serviceProviderUpdate(
        ServiceProviderDtoMock,
        idParam,
        req,
        res,
      );

      // Then
      expect(serviceProviderServiceMock.update).toHaveBeenCalledTimes(1);
      expect(serviceProviderServiceMock.update).toHaveBeenCalledWith(
        idParam,
        ServiceProviderDtoMock,
        req.user.username,
      );
    });

    it("should redirect to the serviceProvider if we can't update the serviceProvider", async () => {
      serviceProviderServiceMock.update = jest.fn(() => {
        throw Error;
      });
      // action
      await serviceProviderController.serviceProviderUpdate(
        ServiceProviderDtoMock,
        idParam,
        req,
        res,
      );
      // assertion
      expect(serviceProviderServiceMock.update).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith(
        `${res.locals.APP_ROOT}/service-provider/${idParam}`,
      );
    });

    it('should update a servicerProvider with URIScheme for redirectUri field and return to the serviceProvider page', async () => {
      ((ServiceProviderDtoMock.redirectUri = [
        'https://url.com',
        'fc+app01://openid_redirect_url',
        'FC-app.02://openid_redirect_url',
        'franceconnect://openid_redirect_url',
      ]),
        await serviceProviderController.serviceProviderUpdate(
          ServiceProviderDtoMock,
          idParam,
          req,
          res,
        ));
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith(
        `${res.locals.APP_ROOT}/service-provider/${idParam}`,
      );
    });

    it('should update a servicerProvider with URIScheme for redirectUriLogout field and return to the serviceProvider page', async () => {
      ((ServiceProviderDtoMock.redirectUriLogout = [
        'https://url.com',
        'fc+app01://openid_redirect_url',
        'FC-app.02://openid_redirect_url',
        'franceconnect://openid_redirect_url',
      ]),
        await serviceProviderController.serviceProviderUpdate(
          ServiceProviderDtoMock,
          idParam,
          req,
          res,
        ));
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith(
        `${res.locals.APP_ROOT}/service-provider/${idParam}`,
      );
    });
  });

  describe('Delete service provider', () => {
    it('Should redirect if service provider is removed', async () => {
      // set up
      const key = 'key';
      const body = { name: 'name' };

      // action
      serviceProviderServiceMock.deleteServiceProviderById.mockReturnValueOnce(
        {},
      );
      await serviceProviderController.deleteServiceProvider(
        key,
        req,
        res,
        body,
      );

      // expect
      expect(
        serviceProviderServiceMock.deleteServiceProviderById,
      ).toHaveBeenCalledWith(key, req.user.username);
      expect(
        serviceProviderServiceMock.deleteServiceProviderById,
      ).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith(
        `${res.locals.APP_ROOT}/service-provider`,
      );
    });

    it('Should not redirect the user but set the res status to 500 for the error handler', async () => {
      // set up
      const key = 'key';
      const body = { name: 'name' };

      // action
      serviceProviderServiceMock.deleteServiceProviderById.mockRejectedValueOnce(
        new Error('Try again buddy'),
      );
      await serviceProviderController.deleteServiceProvider(
        key,
        req,
        res,
        body,
      );
      // expect
      expect(
        serviceProviderServiceMock.deleteServiceProviderById,
      ).toHaveBeenCalledWith(key, req.user.username);
      expect(
        serviceProviderServiceMock.deleteServiceProviderById,
      ).toHaveBeenCalledTimes(1);
      expect(req.flash).toHaveBeenCalledTimes(1);
      expect(req.flash).toHaveBeenCalledWith('globalError', 'Try again buddy');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.redirect).toHaveBeenCalledTimes(0);
    });
  });

  describe('Delete several service provider', () => {
    it('Should redirect after remove several servide provider', async () => {
      // set up
      const deleteServiceProviderDto = {
        deleteItems: ['aaaa', 'bbbb', 'cccc'],
        name: 'aaa, bbb, ccc',
      };

      // action
      serviceProviderServiceMock.deleteManyServiceProvidersById.mockReturnValueOnce(
        {},
      );
      await serviceProviderController.deleteServiceProviders(
        deleteServiceProviderDto,
        res,
        req,
      );

      // expect
      expect(
        serviceProviderServiceMock.deleteManyServiceProvidersById,
      ).toHaveBeenCalledWith(
        deleteServiceProviderDto.deleteItems,
        req.user.username,
      );
      expect(
        serviceProviderServiceMock.deleteManyServiceProvidersById,
      ).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith(
        `${res.locals.APP_ROOT}/service-provider`,
      );
    });

    it('Should not redirect the user but set the res status to 500 for error handler', async () => {
      // set up
      const deleteServiceProviderDto = {
        deleteItems: ['aaaa', 'bbbb'],
        name: 'aaa, bbb',
      };

      // action
      serviceProviderServiceMock.deleteManyServiceProvidersById.mockRejectedValueOnce(
        new Error('Try again buddy'),
      );
      await serviceProviderController.deleteServiceProviders(
        deleteServiceProviderDto,
        res,
        req,
      );

      // expect
      expect(
        serviceProviderServiceMock.deleteManyServiceProvidersById,
      ).toHaveBeenCalledWith(
        deleteServiceProviderDto.deleteItems,
        req.user.username,
      );
      expect(
        serviceProviderServiceMock.deleteManyServiceProvidersById,
      ).toHaveBeenCalledTimes(1);
      expect(req.flash).toHaveBeenCalledTimes(1);
      expect(req.flash).toHaveBeenCalledWith('globalError', 'Try again buddy');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.redirect).toHaveBeenCalledTimes(0);
    });
  });

  describe('GenerateNewSecret View', () => {
    it('should get a service Provider and render generate client secret view', async () => {
      claimsServiceMock.getAll.mockResolvedValue(claimsListMock);
      const serviceProvider = {
        IPServerAddressesAndRanges: ['1.1.1.1'],
        active: 'true',
        email: ['v@b.com'],
        emails: 'v@b.com',
        ipsRanges: '1.1.1.1',
        key: 'cb55015c-7fb5-49b4-9006-e523552bc3e7',
        name: 'ProConnect Generate Secret 9',
        postLogoutUri: 'https://proconnect.gouv.fr',
        post_logout_redirect_uris: ['https://proconnect.gouv.fr'],
        redirectUri: 'https://proconnect.gouv.fr',
        redirect_uris: ['https://proconnect.gouv.fr'],
        site: 'https://proconnect.gouv.fr',
        status: 'public',
        scopes: [...scopeList],
        trustedIdentity: false,
        grant_types: 'default',
        response_types: 'default',
        jwksUri: undefined,
        userinfo_signed_response_alg: '',
      };

      serviceProviderServiceMock.findById.mockResolvedValue(serviceProvider);
      scopesServiceMock.getScopesGroupedByFd.mockResolvedValue(scopesGroupMock);
      const result = await serviceProviderController.findOne(idParam, req);
      expect(req.flash).toHaveBeenCalledTimes(1);
      expect(req.flash).toHaveBeenCalledWith('values', {
        ...serviceProvider,
      });
      expect(result).toEqual({
        id: idParam,
        csrfToken: 'mygreatcsrftoken',
        scopesGroupedByFd: scopesGroupMock,
        scopesSelected: scopeList,
        claimsSelected: ['amr'],
        claims: [
          {
            name: 'amr',
            id,
          },
        ],
      });
    });
  });

  describe('Generate a new client secret', () => {
    it('Should redirect after generation of a client secret', async () => {
      // set up
      const serviceProvider = {
        IPServerAddressesAndRanges: ['1.1.1.1'],
        active: 'true',
        email: ['v@b.com'],
        emails: 'v@b.com',
        ipsRanges: '1.1.1.1',
        key: 'cb55015c-7fb5-49b4-9006-e523552bc3e7',
        name: 'FranceConnect TEST 9',
        postLogoutUri: 'https://FranceConnect.com',
        post_logout_redirect_uris: ['https://FranceConnect.com'],
        redirectUri: 'https://FranceConnect.com',
        redirect_uris: ['https://FranceConnect.com'],
        site: 'https://FranceConnect8888.com',
        status: 'public',
        client_secret:
          '$2b$10$EO3FnI3YKfnnvUlvr084wegEgEPeRPRMdE2VJwMHpAsNkaMv1n9pG',
        scopes: [...scopeList],
        trustedIdentity: false,
      };
      const generateNewClientSecretDTO = {
        name: 'aaa, bbb, ccc',
        key: 'clientID',
        client_secret: 'ancien secret hash',
      };

      const key = 'key';

      // action
      serviceProviderServiceMock.generateNewSecret.mockReturnValueOnce(
        serviceProvider,
      );
      await serviceProviderController.generateNewClientSecret(
        key,
        generateNewClientSecretDTO,
        req,
        res,
      );

      // expect
      expect(
        serviceProviderServiceMock.generateNewSecret,
      ).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith(
        `${res.locals.APP_ROOT}/service-provider`,
      );
    });

    it('Should redirect after generation of a client secret', async () => {
      // set up
      const generateNewClientSecretDTO = {
        name: 'aaa, bbb, ccc',
        key: 'clientID',
        client_secret: 'ancien secret hash',
      };

      const key = 'key';

      // action
      serviceProviderServiceMock.generateNewSecret.mockRejectedValueOnce(
        new Error(),
      );

      await serviceProviderController.generateNewClientSecret(
        key,
        generateNewClientSecretDTO,
        req,
        res,
      );

      // expect
      expect(
        serviceProviderServiceMock.generateNewSecret,
      ).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.redirect).toHaveBeenCalledTimes(0);
    });
  });

  describe('GET: paginate[mongodb] serviceProvider (list) ', () => {
    const itemId: ObjectId = new ObjectId('5d35b91e70332098440d0f85');

    const defaultSpMock = {
      _id: itemId,
      name: 'Site Usagers',
      redirect_uris: ['https://url.com'],
      post_logout_redirect_uris: [''],
      jwks_uri: 'https://monfs.com/jwks',
      site: ['https://monsite.com'],
      email: 'v@b.com',
      IPServerAddressesAndRanges: ['192.0.0.0'],
      active: true,
      type: 'public',
      secretCreatedAt: new Date('2019-11-08T09:52:29.984Z'),
      client_secret: '76eded44d32b40c0cb1006065',
      key: '6925fb8143c76eded44d32b40c0cb1006065f7f003de52712b78985704f39950',
      createdAt: new Date('2019-11-08T09:52:29.984Z'),
      updatedBy: userMock,
      scopes: [...scopeList],
      trustedIdentity: false,
      entityId:
        'a0cd64372db6ecf39c317c0c74ce90f02d8ad7d510ce054883b759d666a996bc',
    };

    it('should return a list of service providers even with sort/action as undefined values', async () => {
      // Setup
      const search = undefined;
      const sortField = undefined;
      const sortDirection = undefined;
      const page = '0';
      const limit = '10';

      // Mocking return value of serviceProviderController.list(page, limit)
      const serviceProvidersResult = {
        items: [defaultSpMock, defaultSpMock],
        itemCount: 2,
        totalItems: 2,
        pageCount: 0,
        next: '',
        previous: '',
      };

      // Actions
      // Mocking the return of the paginate function
      serviceProviderServiceMock.paginate.mockResolvedValueOnce(
        serviceProvidersResult,
      );
      // Calling the list function
      const result = await serviceProviderController.list(
        req,
        search,
        sortField,
        sortDirection,
        page,
        limit,
      );

      // Expected
      expect(result.serviceProviders.length).toEqual(2);
      expect(result.serviceProviders).toEqual([defaultSpMock, defaultSpMock]);
    });

    it('should return a list sort alphabetically of service providers if sortField="name" and sortDirection="asc"', async () => {
      // Setup
      const page = '0';
      const limit = '10';
      const search = undefined;
      const sortField = 'name';
      const sortDirection = 'asc';

      // Mocking Items
      const itemTest1: ServiceProvider = {
        name: 'joker',
        ...defaultSpMock,
      };

      const itemTest2: ServiceProvider = {
        name: 'Batman',
        ...defaultSpMock,
      };

      // Mocking return value of serviceProviderController.list(page, limit)
      const serviceProvidersResult = {
        items: [itemTest1, itemTest2],
        itemCount: 2,
        totalItems: 2,
        pageCount: 0,
        next: '',
        previous: '',
      };

      // Actions
      // Mocking the return of the paginate function

      serviceProviderServiceMock.paginate.mockResolvedValueOnce(
        serviceProvidersResult,
      );
      // Calling the list function
      const resultat = await serviceProviderController.list(
        req,
        search,
        sortField,
        sortDirection,
        page,
        limit,
      );

      // Expected
      expect(resultat.serviceProviders.length).toEqual(2);
      expect(resultat.serviceProviders).toEqual([itemTest2, itemTest1]);
    });

    it('should return a list sort reverse-alphabetically of service providers if sortField="name" and sortDirection="desc"', async () => {
      // Setup
      const page = '0';
      const limit = '10';
      const search = undefined;
      const sortField = 'name';
      const sortDirection = 'desc';

      // Mocking Items
      const itemTest1: ServiceProvider = {
        name: 'Batman',
        ...defaultSpMock,
      };

      const itemTest2: ServiceProvider = {
        name: 'joker',
        ...defaultSpMock,
      };

      // Mocking return value of serviceProviderController.list(page, limit)
      const serviceProvidersResult = {
        items: [itemTest1, itemTest2],
        itemCount: 2,
        totalItems: 2,
        pageCount: 0,
        next: '',
        previous: '',
      };

      // Actions
      // Mocking the return of the paginate function
      serviceProviderServiceMock.paginate.mockResolvedValueOnce(
        serviceProvidersResult,
      );
      // Calling the list function
      const resultat = await serviceProviderController.list(
        req,
        search,
        sortField,
        sortDirection,
        page,
        limit,
      );

      // Expected
      expect(resultat.serviceProviders.length).toEqual(2);
      expect(resultat.serviceProviders).toEqual([itemTest2, itemTest1]);
    });

    it('should return call paginate with correct params when list', async () => {
      // Setup
      const page = '0';
      const limit = '10';
      const sortField = 'name';
      const sortDirection = 'desc';
      const search = 'joker';

      // Mocking return value of serviceProviderController.list(page, limit)
      const serviceProvidersResult = {
        items: [
          {
            id: itemId,
            name: 'joker',
            ...defaultSpMock,
          },
        ],
        total: 2,
      };

      serviceProviderServiceMock.paginate.mockResolvedValue(
        serviceProvidersResult,
      );

      // Calling the list function
      await serviceProviderController.list(
        req,
        search,
        sortField,
        sortDirection,
        page,
        limit,
      );

      expect(serviceProviderRepository.countBy).toHaveBeenCalledTimes(1);
      expect(serviceProviderServiceMock.paginate).toHaveBeenCalledTimes(1);
      expect(serviceProviderServiceMock.paginate).toHaveBeenCalledWith({
        page: 0,
        limit: 10,
        search: { fields: ['name', 'key'], value: search },
        sort: { field: sortField, direction: sortDirection },
        defaultSort: { field: 'createdAt', direction: 'desc' },
      });
    });
  });
});
