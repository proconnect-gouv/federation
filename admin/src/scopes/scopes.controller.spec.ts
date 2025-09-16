import { ObjectId } from 'mongodb';
import { ConfigService } from 'nestjs-config';
import { Test, TestingModule } from '@nestjs/testing';
import { ScopesService } from './scopes.service';
import { ScopesController } from './scopes.controller';
import { IScopes } from './interface/scopes.interface';
import {
  scopesMock,
  scopesListMock,
  scopesListGroupedByFdMock,
} from './fixture';

const id = new ObjectId('5d9c677da8bb151b00720451');

export const reqMock = {
  flash: jest.fn(),
  user: {
    username: 'Harry Seldon',
  },
  csrfToken: function csrfToken() {
    return 'foundationCsrfToken';
  },
  body: {
    scope: 'toto',
    label: 'toto label',
    fd: 'Direction générale des Finances publiques',
  },
};

export const resMock = {
  redirect: jest.fn(),
  status: jest.fn(),
  locals: {
    APP_ROOT: '/trantor/foundation',
  },
};

const ScopesServiceMock = {
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  count: jest.fn(),
  getAll: jest.fn(),
  getById: jest.fn(),
  getScopesGroupedByFd: jest.fn(),
};

const configServiceMock = {
  get: jest.fn(),
};

describe('Scopes Controller', () => {
  let controller: ScopesController;
  let scopeService: ScopesService;

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScopesController],
      providers: [
        {
          provide: ScopesService,
          useValue: ScopesServiceMock,
        },
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
      ],
    }).compile();

    controller = module.get<ScopesController>(ScopesController);
    scopeService = module.get<ScopesService>(ScopesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('list()', () => {
    it('should exist', () => {
      expect(controller.list).toBeDefined();
    });

    it('should return scope and csrf', async () => {
      // Setup
      ScopesServiceMock.getAll.mockResolvedValueOnce(scopesListMock);

      // Action
      const result = await controller.list(reqMock);

      // Expected
      expect(result).toEqual({
        csrfToken: 'foundationCsrfToken',
        scopesAndLabelsList: scopesListMock,
      });
    });

    it('should return scopes and csrf', async () => {
      // Setup
      ScopesServiceMock.getAll.mockResolvedValueOnce(scopesListMock);

      // Action
      const result = await controller.list(reqMock);

      // Expected
      expect(result).toStrictEqual({
        csrfToken: 'foundationCsrfToken',
        scopesAndLabelsList: scopesListMock,
      });
    });
  });

  describe('showCreateScopeForm()', () => {
    it('should exist', () => {
      expect(controller.showCreateScopeForm).toBeDefined();
    });

    it('should return the csrf', async () => {
      // setup
      ScopesServiceMock.getScopesGroupedByFd.mockResolvedValueOnce(
        scopesListGroupedByFdMock,
      );
      // action
      const result = await controller.showCreateScopeForm(reqMock);
      // assertion
      expect(result).toEqual({
        csrfToken: 'foundationCsrfToken',
        scopesGroupedByFd: scopesListGroupedByFdMock,
      });
    });
  });

  describe('createScopeAndLabels()', () => {
    it('should add a new scope label', async () => {
      // Action
      await controller.createScopeAndLabels(scopesMock, reqMock, resMock);
      // Expected
      expect(resMock.redirect).toHaveBeenCalledTimes(1);
      expect(resMock.redirect).toHaveBeenCalledWith(
        `${resMock.locals.APP_ROOT}/scopes/label`,
      );
      expect(reqMock.flash).toHaveBeenCalledWith(
        'success',
        `Le label ${scopesMock.label} pour le scope ${scopesMock.scope} a été créé avec succès !`,
      );
    });

    it('should return to data-provider/label/create if it fails', async () => {
      // Setup
      const error = new Error('something');
      ScopesServiceMock.create.mockRejectedValueOnce(error);

      // Action
      await controller.createScopeAndLabels(scopesMock, reqMock, resMock);
      // Expected
      expect(resMock.redirect).toHaveBeenCalledTimes(1);
      expect(resMock.redirect).toHaveBeenCalledWith(
        `${resMock.locals.APP_ROOT}/scopes/label/create`,
      );
      expect(reqMock.flash).toHaveBeenCalledWith(
        'globalError',
        "Impossible d'enregistrer le label",
      );
    });
  });

  describe('showUpdateScopeForm', () => {
    it('should have a showCreateScopeForm method', () => {
      expect(controller.showUpdateScopeForm).toBeDefined();
    });

    it('should render the update form', async () => {
      // Setup
      ScopesServiceMock.getById.mockResolvedValueOnce({
        scope: 'myGreatScope',
        label: 'myGreatLabel',
        fd: 'myGreatFD',
      });
      ScopesServiceMock.getScopesGroupedByFd.mockResolvedValue(
        scopesListGroupedByFdMock,
      );

      // Action
      const result = await controller.showUpdateScopeForm(
        id.toString(),
        reqMock,
      );

      // Assertion
      expect(ScopesServiceMock.getById).toHaveBeenCalledTimes(1);
      expect(ScopesServiceMock.getById).toHaveBeenCalledWith(id);
      expect(result).toEqual({
        csrfToken: 'foundationCsrfToken',
        scope: 'myGreatScope',
        label: 'myGreatLabel',
        fd: 'myGreatFD',
        scopesGroupedByFd: scopesListGroupedByFdMock,
        _id: id.toString(),
      });
    });
  });

  describe('updateScopeAndLabels()', () => {
    it('should exist', () => {
      expect(controller.updateScopeAndLabels).toBeDefined();
    });

    it('should update the scope label entry corresponding to the id param', async () => {
      const updatedScopeLabel: IScopes = {
        _id: new ObjectId('5d9c677da8bb151b00720451'),
        fd: 'DGFIP',
        scope: 'Seldon2222',
        label: 'Seldon222 Label (dgfip)',
      };
      // Action
      const returnedValue = await controller.updateScopeAndLabels(
        updatedScopeLabel,
        id.toString(),
        reqMock,
        resMock,
      );
      // Expected
      expect(resMock.redirect).toHaveBeenCalledTimes(1);
      expect(reqMock.flash).toHaveBeenCalledWith(
        'success',
        `Le label ${updatedScopeLabel.label} a été modifié avec succès !`,
      );
      expect(resMock.redirect).toHaveBeenCalledWith(
        `${resMock.locals.APP_ROOT}/scopes/label`,
      );
    });

    it('should throw an error if scope label entry can not be update', async () => {
      // Setup
      const updatedScopeLabel: IScopes = {
        _id: new ObjectId('5d9c677da8bb151b00720451'),
        fd: 'DGFIP',
        scope: 'Seldon2222',
        label: 'Seldon222 Label (dgfip)',
      };
      const error = new Error('something');
      ScopesServiceMock.update.mockRejectedValueOnce(error);

      // Action
      await controller.updateScopeAndLabels(
        updatedScopeLabel,
        id.toString(),
        reqMock,
        resMock,
      );

      // Expected
      expect(resMock.redirect).toHaveBeenCalledTimes(1);
      expect(reqMock.flash).toHaveBeenCalledWith(
        'globalError',
        'Impossible de modifier le label',
      );
      expect(resMock.redirect).toHaveBeenCalledWith(
        `${resMock.locals.APP_ROOT}/scopes/label/update/5d9c677da8bb151b00720451`,
      );
    });
  });

  describe('deleteScopeAndLabel()', () => {
    it('should exist', () => {
      expect(controller.deleteScopeAndLabel).toBeDefined();
    });

    it('should delete the corresponding label', async () => {
      // Setup
      const body = {
        scope: 'toto',
        label: 'toto label',
        fd: 'Direction générale des Finances publiques',
      };

      // Action
      await controller.deleteScopeAndLabel(
        id.toString(),
        reqMock,
        resMock,
        body,
      );

      // Expected
      expect(reqMock.flash).toHaveBeenCalledWith(
        'success',
        `Le scope ${body.scope}:  ${body.label} a été supprimé avec succès !`,
      );
      expect(resMock.redirect).toHaveBeenCalledTimes(1);
      expect(resMock.redirect).toHaveBeenCalledWith(
        `${resMock.locals.APP_ROOT}/scopes/label`,
      );
    });

    it('should throw an error if scope label entry can not be removed', async () => {
      // Setup
      const body = {
        scope: 'toto',
        label: 'toto label',
        fd: 'dgfip',
      };
      const error = new Error('something');

      ScopesServiceMock.remove.mockRejectedValueOnce(error);
      // Action
      await controller.deleteScopeAndLabel(
        id.toString(),
        reqMock,
        resMock,
        body,
      );

      // Expected
      expect(resMock.redirect).toHaveBeenCalledTimes(1);
      expect(reqMock.flash).toHaveBeenCalledWith('globalError', 'something');
      expect(resMock.redirect).toHaveBeenCalledWith(
        `${resMock.locals.APP_ROOT}/scopes/label`,
      );
    });
  });

  it('call scopeService.delete', async () => {
    // Setup
    const body = {
      scope: 'toto',
      label: 'toto label',
      fd: 'Direction générale des Finances publiques',
    };
    const error = new Error('something');

    jest.spyOn(scopeService, 'remove').mockRejectedValueOnce(error);

    // Action
    await controller.deleteScopeAndLabel(id.toString(), reqMock, resMock, body);

    // Expected
    expect(scopeService.remove).toHaveBeenCalledTimes(1);
    expect(scopeService.remove).toHaveBeenCalledWith(id, reqMock.user.username);
  });
});
