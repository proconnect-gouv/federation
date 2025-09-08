import { ObjectId } from 'mongodb';
import { Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Scopes } from '../scopes/scopes.mongodb.entity';
import { ScopesService } from './scopes.service';
import { IScopes } from './interface';
import { LoggerService } from '../logger/logger.service';
import { ICrudTrack } from '../interfaces';
import {
  scopesMock,
  scopesListMock,
  scopesListGroupedByFdMock,
} from './fixture';

const id = new ObjectId('5d9c677da8bb151b00720451');

const scopesRepositoryMock = {
  find: jest.fn(),
  count: jest.fn(),
  findOneBy: jest.fn(),
  findAndCount: jest.fn(),
  save: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const insertResultMock = {
  identifiers: [{ id: 'insertedIdValueMock' }],
};

const loggerMock = {
  businessEvent: jest.fn(),
};

describe('ScopesService', () => {
  let service: ScopesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmModule.forFeature([Scopes], 'fc-mongo')],
      providers: [ScopesService, Repository, LoggerService],
    })
      .overrideProvider(getRepositoryToken(Scopes, 'fc-mongo'))
      .useValue(scopesRepositoryMock)
      .overrideProvider(LoggerService)
      .useValue(loggerMock)
      .compile();

    service = module.get<ScopesService>(ScopesService);

    jest.resetAllMocks();

    scopesRepositoryMock.find.mockResolvedValueOnce(scopesListMock);
    scopesRepositoryMock.findOneBy.mockResolvedValueOnce(scopesMock);
    scopesRepositoryMock.insert.mockResolvedValueOnce(insertResultMock);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('track', () => {
    it('should call logger.businessEvent', () => {
      // Given
      const logMock = {} as ICrudTrack;
      // When
      // tslint:disable-next-line:no-string-literal
      service['track'](logMock);
      // Then
      expect(loggerMock.businessEvent).toHaveBeenCalledTimes(1);
      expect(loggerMock.businessEvent).toHaveBeenCalledWith(logMock);
    });
  });

  describe('getAll()', () => {
    it('should exist', () => {
      expect(service.getAll).toBeDefined();
    });

    it('shoud return the array of all scopes', async () => {
      // Action
      const result = await service.getAll();

      // Expected
      expect(result.length).toEqual(3);
    });
  });

  describe('getbyId()', () => {
    it('should exist', () => {
      expect(service.getById).toBeDefined();
    });

    it('shoud return a scope entry for a specific ID', async () => {
      // Action
      const result = await service.getById(id);

      // Expected
      expect(result).toEqual({
        id,
        scope: 'Seldon',
        label: 'Seldon Label',
        fd: 'Direction générale des Finances publiques',
      });
    });
  });

  describe('create()', () => {
    let scopeAndLabel: IScopes;

    beforeEach(() => {
      scopeAndLabel = {
        id,
        scope: 'Seldon',
        label: 'Seldon Label',
        fd: 'Direction générale des Finances publiques',
      };
    });

    it('should exist', () => {
      expect(service.create).toBeDefined();
    });

    it('should create a new label', async () => {
      // Setup
      const userMock = 'userMockValue';
      // Action
      const result: Scopes = await service.create(scopeAndLabel, userMock);

      // Expected
      expect(scopesRepositoryMock.insert).toHaveBeenCalledTimes(1);
      /**
       * @todo enhance UT
       *
       * Can not easily test toHaveBeenCalledWith,
       * it would require much more mocking
       * that is way beyond current issue.
       */
    });

    it('calls the tracking method', async () => {
      // Setup
      const saveSpy = jest
        .spyOn(scopesRepositoryMock, 'save')
        .mockResolvedValue(scopeAndLabel);

      const userMock = 'userMockValue';
      // tslint:disable-next-line:no-string-literal
      service['track'] = jest.fn();

      // Action
      await service.create(scopeAndLabel, userMock);

      // expect
      // tslint:disable-next-line:no-string-literal
      expect(service['track']).toHaveBeenCalledTimes(1);
      // tslint:disable-next-line:no-string-literal
      expect(service['track']).toHaveBeenCalledWith({
        entity: 'scope',
        action: 'create',
        user: userMock,
        id: insertResultMock.identifiers[0].id,
        name: scopeAndLabel.scope,
      });
    });
  });

  describe('update()', () => {
    it('should be defined', () => {
      expect(service.update).toBeDefined();
    });

    it('should update the label matching the id param', async () => {
      const saveSpy = jest
        .spyOn(scopesRepositoryMock, 'save')
        .mockResolvedValue(scopesMock);
      const userMock = 'userMockValue';

      // Action
      await service.update(id, userMock, scopesMock);

      // Expected
      expect(saveSpy).toHaveBeenCalledTimes(1);
      expect(saveSpy).toHaveBeenCalledWith({
        id,
        scope: 'Seldon',
        label: 'Seldon Label (Direction générale des Finances publiques)',
        fd: 'Direction générale des Finances publiques',
        updatedBy: userMock,
      });
    });

    it('calls the tracking method', async () => {
      const saveSpy = jest
        .spyOn(scopesRepositoryMock, 'save')
        .mockResolvedValue(scopesMock);
      const userMock = 'userMockValue';
      // tslint:disable-next-line:no-string-literal
      service['track'] = jest.fn();

      // Action
      await service.update(id, userMock, scopesMock);

      // expect
      // tslint:disable-next-line:no-string-literal
      expect(service['track']).toHaveBeenCalledTimes(1);
      // tslint:disable-next-line:no-string-literal
      expect(service['track']).toHaveBeenCalledWith({
        entity: 'scope',
        action: 'update',
        user: userMock,
        name: 'Seldon',
        id: id.toString(),
      });
    });
  });

  describe('remove()', () => {
    it('should exist', () => {
      expect(service.remove).toBeDefined();
    });

    it('should delete the `scope` matching the id', async () => {
      // Setup
      const deleteSpy = jest
        .spyOn(scopesRepositoryMock, 'delete')
        .mockResolvedValue({});
      const userMock = 'userMockValue';

      // Action
      await service.remove(id, userMock);

      // Expected
      expect(deleteSpy).toHaveBeenCalledTimes(1);
      expect(deleteSpy).toHaveBeenCalledWith({ id });
    });

    it('calls the tracking method', async () => {
      const deleteSpy = jest.spyOn(scopesRepositoryMock, 'delete');
      const userMock = 'userMockValue';
      // tslint:disable-next-line:no-string-literal
      service['track'] = jest.fn();

      // Action
      await service.remove(id, userMock);
      // expect
      // tslint:disable-next-line:no-string-literal
      expect(service['track']).toHaveBeenCalledTimes(1);
      // tslint:disable-next-line:no-string-literal
      expect(service['track']).toHaveBeenCalledWith({
        entity: 'scope',
        action: 'delete',
        user: userMock,
        name: 'Seldon',
        id: id.toString(),
      });
    });
  });
});
