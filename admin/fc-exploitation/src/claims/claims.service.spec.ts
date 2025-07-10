import { ObjectID } from 'mongodb';
import { Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Claims } from './claims.mongodb.entity';
import { ClaimsService } from './claims.service';
import { IClaims } from './interface';

const id: string = new ObjectID('5d9c677da8bb151b00720451');
const id2: string = new ObjectID('5d9c677da8bb151b00720452');

const claimsRepositoryMock = {
  find: jest.fn(),
  count: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const claimMock: IClaims = {
  id,
  name: 'Foo',
};

const claimsMock: IClaims[] = [
  {
    id,
    name: 'Foo',
  },
  {
    id: id2,
    name: 'Bar',
  },
];

describe('ClaimsService', () => {
  let service: ClaimsService;

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmModule.forFeature([Claims], 'fc-mongo')],
      providers: [ClaimsService, Repository],
    })
      .overrideProvider(getRepositoryToken(Claims, 'fc-mongo'))
      .useValue(claimsRepositoryMock)
      .compile();

    service = module.get<ClaimsService>(ClaimsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAll()', () => {
    it('shoud return the array of all claims', async () => {
      // Given
      claimsRepositoryMock.find.mockResolvedValueOnce(claimsMock);
      const expectedResult: IClaims[] = [
        {
          id,
          name: 'Foo',
        },
        {
          id: id2,
          name: 'Bar',
        },
      ];

      // When
      const result = await service.getAll();

      // Then
      expect(result.length).toEqual(2);
      expect(claimsRepositoryMock.find).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual(expectedResult);
    });
  });

  describe('getById()', () => {
    it('shoud return a claim for a specific ID', async () => {
      // Given
      claimsRepositoryMock.findOne.mockResolvedValueOnce(claimMock);
      const expectedResult: IClaims = {
        id,
        name: 'Foo',
      };

      // When
      const result = await service.getById(id);

      // Then
      expect(claimsRepositoryMock.findOne).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual(expectedResult);
    });
  });

  describe('create()', () => {
    it('should create a new claim', async () => {
      // Given
      const expectedResult = {
        claim: 'Foo',
      };
      claimsRepositoryMock.save.mockResolvedValueOnce(expectedResult);

      // Action
      const result: Pick<Claims, 'name'> = await service.create(claimMock);

      // Expected
      expect(claimsRepositoryMock.save).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual(expectedResult);
    });
  });

  describe('update()', () => {
    it('should update the claim matching the id param', async () => {
      // Given
      const expectedResult = {
        id,
        claim: 'Foo',
      };
      claimsRepositoryMock.save.mockResolvedValueOnce(expectedResult);

      // When
      const result = await service.update(id, claimMock);

      // Then
      expect(claimsRepositoryMock.save).toBeCalledTimes(1);
      expect(claimsRepositoryMock.save).toBeCalledWith(claimMock);
      expect(result).toStrictEqual(expectedResult);
    });
  });

  describe('remove()', () => {
    it('should delete the `claim` matching the id', async () => {
      // Setup
      claimsRepositoryMock.delete.mockResolvedValueOnce({});

      // Action
      const result = await service.remove(id);

      // Expected
      expect(claimsRepositoryMock.delete).toBeCalledTimes(1);
      expect(claimsRepositoryMock.delete).toBeCalledWith(id);
      expect(result).toStrictEqual({});
    });
  });
});
