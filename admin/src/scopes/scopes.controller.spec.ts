import { ObjectID } from 'mongodb';
import { ConfigService } from 'nestjs-config';
import { Test, TestingModule } from '@nestjs/testing';
import { InstanceService } from '@pc/shared/utils';
import { ScopesService } from './scopes.service';
import { ScopesController } from './scopes.controller';
import { ClaimsService, claimsListMock, claimMock, IClaims } from '../claims';
import { IScopes } from './interface/scopes.interface';
import {
  scopesMock,
  scopesListMock,
  scopesListGroupedByFdMock,
} from './fixture';

const id: ObjectID = new ObjectID('5d9c677da8bb151b00720451');

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

const claimsServiceMock = {
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  count: jest.fn(),
  getAll: jest.fn(),
  getById: jest.fn(),
};

const configServiceMock = {
  get: jest.fn(),
};

const instanceServiceMock = {
  isCl: jest.fn(),
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
          provide: ClaimsService,
          useValue: claimsServiceMock,
        },
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
        {
          provide: InstanceService,
          useValue: instanceServiceMock,
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
      instanceServiceMock.isCl.mockReturnValueOnce(true);
      ScopesServiceMock.getAll.mockResolvedValueOnce(scopesListMock);

      // Action
      const result = await controller.list(reqMock);

      // Expected
      expect(result).toStrictEqual({
        csrfToken: 'foundationCsrfToken',
        scopesAndLabelsList: scopesListMock,
      });
    });

    it('should return scopes, claims and csrf', async () => {
      // Setup
      instanceServiceMock.isCl.mockReturnValueOnce(false);
      ScopesServiceMock.getAll.mockResolvedValueOnce(scopesListMock);
      claimsServiceMock.getAll.mockResolvedValueOnce(claimsListMock);

      // Action
      const result = await controller.list(reqMock);

      // Expected
      expect(result).toStrictEqual({
        csrfToken: 'foundationCsrfToken',
        scopesAndLabelsList: scopesListMock,
        claimsList: [
          {
            id: new ObjectID('5d9c677da8bb151b00720451'),
            name: 'amr',
          },
        ],
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
      const result = await controller.showUpdateScopeForm(id, reqMock);

      // Assertion
      expect(ScopesServiceMock.getById).toHaveBeenCalledTimes(1);
      expect(ScopesServiceMock.getById).toHaveBeenCalledWith(id);
      expect(result).toEqual({
        csrfToken: 'foundationCsrfToken',
        scope: 'myGreatScope',
        label: 'myGreatLabel',
        fd: 'myGreatFD',
        scopesGroupedByFd: scopesListGroupedByFdMock,
        id,
      });
    });
  });

  describe('updateScopeAndLabels()', () => {
    it('should exist', () => {
      expect(controller.updateScopeAndLabels).toBeDefined();
    });

    it('should update the scope label entry corresponding to the id param', async () => {
      const updatedScopeLabel: IScopes = {
        id: new ObjectID('5d9c677da8bb151b00720451'),
        fd: 'DGFIP',
        scope: 'Seldon2222',
        label: 'Seldon222 Label (dgfip)',
      };
      // Action
      const returnedValue = await controller.updateScopeAndLabels(
        updatedScopeLabel,
        id,
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
        id: new ObjectID('5d9c677da8bb151b00720451'),
        fd: 'DGFIP',
        scope: 'Seldon2222',
        label: 'Seldon222 Label (dgfip)',
      };
      const error = new Error('something');
      ScopesServiceMock.update.mockRejectedValueOnce(error);

      // Action
      await controller.updateScopeAndLabels(
        updatedScopeLabel,
        id,
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
      await controller.deleteScopeAndLabel(id, reqMock, resMock, body);

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
      await controller.deleteScopeAndLabel(id, reqMock, resMock, body);

      // Expected
      expect(resMock.redirect).toHaveBeenCalledTimes(1);
      expect(reqMock.flash).toHaveBeenCalledWith('globalError', 'something');
      expect(resMock.redirect).toHaveBeenCalledWith(
        `${resMock.locals.APP_ROOT}/scopes/label`,
      );
    });
  });

  describe('showNewClaimForm()', () => {
    it('should return the csrf', async () => {
      // When
      const result = await controller.showNewClaimForm(reqMock);
      // Then
      expect(result).toEqual({
        csrfToken: 'foundationCsrfToken',
        action: 'creation',
      });
    });
  });

  describe('addNewClaim()', () => {
    it('should add a new claim', async () => {
      // When
      await controller.addNewClaim(claimMock, reqMock, resMock);

      // Then
      expect(resMock.redirect).toHaveBeenCalledTimes(1);
      expect(resMock.redirect).toHaveBeenCalledWith(
        `${resMock.locals.APP_ROOT}/scopes/label`,
      );
      expect(reqMock.flash).toHaveBeenCalledWith(
        'success',
        `Le claim ${claimMock.name} a été créé avec succès !`,
      );
    });

    it('should return to data-provider/label/create if it fails', async () => {
      // Given
      const error = new Error('something');
      claimsServiceMock.create.mockRejectedValueOnce(error);

      // When
      await controller.addNewClaim(claimMock, reqMock, resMock);

      // Then
      expect(resMock.redirect).toHaveBeenCalledTimes(1);
      expect(resMock.redirect).toHaveBeenCalledWith(
        `${resMock.locals.APP_ROOT}/scopes/label/create`,
        {
          action: 'creation',
        },
      );
      expect(reqMock.flash).toHaveBeenCalledWith(
        'globalError',
        "Impossible d'enregistrer le claim",
      );
    });
  });

  describe('showUpdateClaimForm()', () => {
    it('should render the update form', async () => {
      // Given
      claimsServiceMock.getById.mockResolvedValueOnce({
        name: 'amr',
      });

      // When
      const result = await controller.showUpdateClaimForm(id, reqMock);

      // Then
      expect(claimsServiceMock.getById).toHaveBeenCalledTimes(1);
      expect(claimsServiceMock.getById).toHaveBeenCalledWith(id);
      expect(result).toEqual({
        csrfToken: 'foundationCsrfToken',
        name: 'amr',
        id,
        action: 'update',
      });
    });
  });

  describe('updateClaim()', () => {
    const updatedClaim: IClaims = {
      id: new ObjectID('5d9c677da8bb151b00720451'),
      name: 'foo',
    };

    it('should update the claim entry corresponding to the id param', async () => {
      // When
      await controller.updateClaim(updatedClaim, id, reqMock, resMock);

      // Then
      expect(resMock.redirect).toHaveBeenCalledTimes(1);
      expect(reqMock.flash).toHaveBeenCalledWith(
        'success',
        `Le claim ${updatedClaim.name} a été modifié avec succès !`,
      );
      expect(resMock.redirect).toHaveBeenCalledWith(
        `${resMock.locals.APP_ROOT}/scopes/label`,
      );
    });

    it('should throw an error if claim entry can not be update', async () => {
      // Given
      const error = new Error('something');

      claimsServiceMock.update.mockRejectedValueOnce(error);

      // When
      await controller.updateClaim(updatedClaim, id, reqMock, resMock);

      // Then
      expect(resMock.redirect).toHaveBeenCalledTimes(1);
      expect(reqMock.flash).toHaveBeenCalledWith(
        'globalError',
        'Impossible de modifier le claim',
      );
      expect(
        resMock.redirect,
      ).toHaveBeenCalledWith(
        `${resMock.locals.APP_ROOT}/scopes/claim/form/5d9c677da8bb151b00720451`,
        { action: 'update' },
      );
    });
  });

  describe('removeClaim()', () => {
    const body = {
      id: new ObjectID('5d9c677da8bb151b00720451'),
      name: 'bar',
    };

    it('should delete the corresponding claim', async () => {
      // When
      await controller.removeClaim(id, reqMock, resMock, body);

      // Then
      expect(reqMock.flash).toHaveBeenCalledWith(
        'success',
        `Le claim ${body.name} a été supprimé avec succès !`,
      );
      expect(resMock.redirect).toHaveBeenCalledTimes(1);
      expect(resMock.redirect).toHaveBeenCalledWith(
        `${resMock.locals.APP_ROOT}/scopes/label`,
      );
    });

    it('should throw an error if claim entry can not be removed', async () => {
      // Given
      const error = new Error('something');

      claimsServiceMock.remove.mockRejectedValueOnce(error);

      // When
      await controller.removeClaim(id, reqMock, resMock, body);

      // Then
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
    await controller.deleteScopeAndLabel(id, reqMock, resMock, body);

    // Expected
    expect(scopeService.remove).toHaveBeenCalledTimes(1);
    expect(scopeService.remove).toHaveBeenCalledWith(id, reqMock.user.username);
  });
});
