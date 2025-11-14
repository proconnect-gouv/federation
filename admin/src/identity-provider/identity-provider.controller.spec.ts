import { ConfigService } from 'nestjs-config';
import { Test } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IdentityProviderFromDb } from './identity-provider.mongodb.entity';
import { IdentityProviderController } from './identity-provider.controller';
import { IdentityProviderService } from './identity-provider.service';

import * as classTransformer from 'class-transformer';
import { identityProviderFactory } from './fixture';

describe('IdentityProviderController', () => {
  let identityProviderController;
  const mockedIdentityProviderRepository = {
    findAndCount: jest.fn(),
  };

  const serviceMock = {
    paginate: jest.fn(),
    countIdentityProviders: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    deleteIdentityProvider: jest.fn(),
    findById: jest.fn(),
  };

  const identityProviderDTO = identityProviderFactory.createIdentityProviderDto(
    {
      name: 'trotro',
    },
  );

  const params = {
    id: '648c1742c74d6a3d84b31943',
  };

  const req = {
    flash: jest.fn(),
    csrfToken: function csrfToken() {
      return 'mygreatcsrftoken';
    },
    session: {
      flash: {},
    },
    user: {
      username: 'jean_moust',
    },
    body: identityProviderDTO,
  };

  const res = {
    redirect: jest.fn(),
    status: jest.fn(),
    locals: {
      APP_ROOT: '/foo/bar',
    },
  };

  const configService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [IdentityProviderController],
      providers: [
        IdentityProviderService,
        {
          provide: getRepositoryToken(IdentityProviderService),
          useClass: Repository,
        },
        ConfigService,
      ],
    })
      .overrideProvider(getRepositoryToken(IdentityProviderFromDb, 'fc-mongo'))
      .useValue(mockedIdentityProviderRepository)
      .overrideProvider(IdentityProviderService)
      .useValue(serviceMock)
      .overrideProvider(ConfigService)
      .useValue(configService)
      .compile();

    identityProviderController = module.get<IdentityProviderController>(
      IdentityProviderController,
    );

    jest.resetAllMocks();
  });

  describe('list', () => {
    it('should return the list of the available identity providers', async () => {
      // Setup
      const page = 0;
      const limit = 10;

      // //Mocking item id
      const itemId = new ObjectId();
      //
      // //Mocking Items
      const mockFqdns = ['fqdn1.fr', 'fqdn2.fr'];

      const itemTest1 = identityProviderFactory.createIdentityProviderFromDb({
        _id: itemId,
        fqdns: mockFqdns,
      });

      const itemTest2 = { ...itemTest1 };
      const itemTest3 = { ...itemTest1 };

      // Mocking return value of serviceProviderController.list(page, limit)
      const identityProviders = {
        items: [itemTest1, itemTest2, itemTest3],
        total: 3,
      };

      // Actions
      // Mocking the return of service paginate function
      serviceMock.paginate.mockResolvedValueOnce(identityProviders);

      // Calling the list function
      const listResult = await identityProviderController.list(
        req,
        page,
        limit,
      );

      // Expected
      expect(listResult.totalItems).toEqual(3);
      expect(listResult.identityProviders.length).toEqual(3);
      expect(listResult.identityProviders[0].fqdns).toEqual(mockFqdns);
    });
  });

  describe('get create', () => {
    it('should get identity provider creation form', async () => {
      // setup
      const spy = jest
        .spyOn(serviceMock, 'countIdentityProviders')
        .mockResolvedValue(3);
      // action
      await identityProviderController.showCreationForm(req);
      // expectation
      expect(spy).toHaveBeenCalled();
      expect(serviceMock.countIdentityProviders).toHaveBeenCalledTimes(1);
    });

    it('should keep filled data if the app flashes an error because the totp failed', async () => {
      // Setup
      const idpDtoMock = identityProviderFactory.createIdentityProviderDto({});
      const uid = 'mock-uid';
      const idpMock = identityProviderFactory.createIdentityProviderDto({
        name: 'fip1',
      });

      serviceMock.findById.mockResolvedValueOnce({
        uid: uid,
        identityProviderDto: idpMock,
      });

      const resultMock = {
        ...idpDtoMock,
        active: true,
        discovery: true,
      };

      const reqMock = {
        flash: jest.fn(),
        csrfToken: function csrfToken() {
          return 'mygreatcsrftoken';
        },
        session: {
          flash: {
            errors: [{ _totp: [] }],
            values: [idpDtoMock],
          },
        },
        user: {
          username: 'jean_moust',
        },
        body: identityProviderDTO,
      };

      jest
        .spyOn(classTransformer, 'plainToInstance')
        .mockReturnValueOnce(resultMock);

      // Action
      await identityProviderController.showCreationForm(reqMock);

      // Assertion
      expect(classTransformer.plainToInstance).toHaveBeenCalledTimes(1);
      expect(reqMock.session.flash.values[0]).toStrictEqual(resultMock);
    });
  });

  describe('post create', () => {
    it('should call successfully the service provider create function', async () => {
      // set
      serviceMock.create.mockResolvedValueOnce({
        hasGristPublicationSucceeded: true,
      });
      // action
      await identityProviderController.createIdentityProvider(
        identityProviderDTO,
        req,
        res,
      );
      // expectation
      expect(serviceMock.create).toHaveBeenCalledTimes(1);
      expect(serviceMock.create).toHaveBeenCalledWith(
        identityProviderDTO,
        req.user.username,
      );
      expect(req.flash).toHaveBeenCalledTimes(1);
      expect(req.flash).toHaveBeenCalledWith(
        'success',
        "Le fournisseur d'identité trotro a été créé avec succès !",
      );
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith(
        `${res.locals.APP_ROOT}/identity-provider`,
      );
    });

    it('should fall back in the catch if identityProviderService.create could not handle the request', async () => {
      // setup
      serviceMock.create.mockImplementationOnce(() => {
        throw new Error('Try again buddy');
      });
      // action
      await identityProviderController.createIdentityProvider(
        identityProviderDTO,
        req,
        res,
      );
      // expectation
      expect(serviceMock.create).toHaveBeenCalledTimes(1);
      expect(serviceMock.create).toHaveBeenCalledWith(
        identityProviderDTO,
        req.user.username,
      );
      expect(req.flash).toHaveBeenCalledTimes(2);
      expect(req.flash).toHaveBeenCalledWith('globalError', 'Try again buddy');
      expect(req.flash).toHaveBeenCalledWith('values', req.body);
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith(
        `${res.locals.APP_ROOT}/identity-provider/create`,
      );
    });
  });

  describe('get update', () => {
    it('should get the identity provider from its id and render the update form', async () => {
      const uid = 'mock-uid';
      const idpMock = identityProviderFactory.createIdentityProviderDto({});
      serviceMock.findById.mockResolvedValueOnce({
        uid: uid,
        identityProviderDto: idpMock,
      });

      // When
      await identityProviderController.findOne(params.id, req, res);

      // Then
      expect(serviceMock.findById).toHaveBeenCalledTimes(1);
      expect(serviceMock.findById).toHaveBeenCalledWith(params.id);
      expect(req.flash).toHaveBeenCalledTimes(1);
    });

    it('should keep filled data if the app flashes an error because the totp failed', async () => {
      // Setup
      const identityProviderDto =
        identityProviderFactory.createIdentityProviderDto({});
      const uid = 'mock-uid';
      serviceMock.findById.mockResolvedValueOnce({
        uid: uid,
        identityProviderDto: identityProviderDto,
      });

      const reqMock = {
        flash: jest.fn(),
        csrfToken: function csrfToken() {
          return 'mygreatcsrftoken';
        },
        session: {
          flash: {
            errors: [{ _totp: [] }],
            values: [identityProviderDto],
          },
        },
        user: {
          username: 'jean_moust',
        },
        body: identityProviderDTO,
      };

      jest
        .spyOn(classTransformer, 'plainToInstance')
        .mockReturnValueOnce(identityProviderDto);

      // Action
      await identityProviderController.findOne(params.id, reqMock, res);

      // Assertion
      expect(classTransformer.plainToInstance).toHaveBeenCalledTimes(1);
      expect(reqMock.session.flash.values[0]).toEqual(identityProviderDto);
    });
  });

  describe('post update', () => {
    it('should call the update function from the identity provider service', async () => {
      // set
      serviceMock.update.mockResolvedValueOnce({
        hasGristPublicationSucceeded: true,
      });

      // action
      await identityProviderController.identityProviderUpdate(
        identityProviderDTO,
        params.id,
        req,
        res,
      );
      // expectation
      expect(serviceMock.update).toHaveBeenCalledTimes(1);
      expect(serviceMock.update).toHaveBeenCalledWith(
        params.id,
        identityProviderDTO,
        req.user.username,
      );
      expect(req.flash).toHaveBeenCalledTimes(1);
      expect(req.flash).toHaveBeenCalledWith(
        'success',
        `Le fournisseur d'identité ${identityProviderDTO.title} a été modifié avec succès !`,
      );
    });

    it('should call req.flash if the service throw an error', async () => {
      // setup
      const error = new Error('something');
      serviceMock.update.mockRejectedValueOnce(error);

      // action
      await identityProviderController.identityProviderUpdate(
        identityProviderDTO,
        params.id,
        req,
        res,
      );
      // expectation
      expect(serviceMock.update).toHaveBeenCalledTimes(1);
      expect(req.flash).toHaveBeenCalledTimes(1);
      expect(req.flash).toHaveBeenCalledWith('globalError', error.message);
    });
  });

  describe('Delete identity provider', () => {
    it('Should redirect to the identity providers list if it succeed', async () => {
      // set up
      const id = 'id';
      const body = { name: 'name' };

      // action
      serviceMock.deleteIdentityProvider.mockImplementationOnce(() => {
        return {};
      });
      await identityProviderController.deleteIdentityProvider(
        id,
        req,
        res,
        body,
      );

      // expect
      expect(serviceMock.deleteIdentityProvider).toHaveBeenCalledWith(
        id,
        req.user.username,
      );
      expect(serviceMock.deleteIdentityProvider).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith(
        `${res.locals.APP_ROOT}/identity-provider`,
      );
    });

    it('Should not redirect the user but set the res status to 500 for the error handler', async () => {
      // set up
      const id = 'id';
      const body = { name: 'name' };

      // action
      serviceMock.deleteIdentityProvider.mockImplementationOnce(() => {
        throw new Error('Try again buddy');
      });
      await identityProviderController.deleteIdentityProvider(
        id,
        req,
        res,
        body,
      );
      // expect
      expect(serviceMock.deleteIdentityProvider).toHaveBeenCalledWith(
        id,
        req.user.username,
      );
      expect(serviceMock.deleteIdentityProvider).toHaveBeenCalledTimes(1);
      expect(req.flash).toHaveBeenCalledTimes(1);
      expect(req.flash).toHaveBeenCalledWith('globalError', 'Try again buddy');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.redirect).toHaveBeenCalledTimes(0);
    });
  });
});
