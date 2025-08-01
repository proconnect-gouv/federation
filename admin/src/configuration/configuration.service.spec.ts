import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';

import { ConfigurationService } from './configuration.service';
import { Configuration } from './entity/configuration.mongodb.entity';
import { configuration } from './fixture/configuration.fixtures';

describe('ConfigurationService', () => {
  let service: ConfigurationService;
  const configurationDbResponseMock: any = configuration;
  let configurationRepositoryMock: any;

  beforeEach(async () => {
    const dbMock = {
      collection: jest.fn(() => ({
        find: () => ({
          sort: () => ({
            limit: () => ({
              toArray: jest.fn(() => configurationDbResponseMock),
            }),
          }),
        }),
      })),
    };

    configurationRepositoryMock = {
      save: jest.fn(),
      manager: {
        connection: {
          driver: {
            queryRunner: {
              databaseConnection: {
                db: jest.fn().mockReturnValue(dbMock),
              },
            },
          },
        },
      },
    };
    const spySave = jest.spyOn(configurationRepositoryMock, 'save');
    const module: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmModule.forFeature([Configuration], 'fc-mongo')],
      providers: [ConfigurationService],
    })
      .overrideProvider(getRepositoryToken(Configuration, 'fc-mongo'))
      .useValue(configurationRepositoryMock)
      .compile();
    service = module.get<ConfigurationService>(ConfigurationService);

    jest.resetAllMocks();
    spySave.mockClear();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getLastConfig', () => {
    it('should return allConfigData', async () => {
      // setup
      // action
      const result = await service.getLastConfig();

      // assertion
      expect(result).toEqual(configurationDbResponseMock[0]);
    });
  });

  describe('getLastConfigIndisponibilityData', () => {
    it('should return useful indisponibility data', async () => {
      // setup
      service.getLastConfig = jest
        .fn()
        .mockResolvedValueOnce(configurationDbResponseMock[0]);
      // action
      const result = await service.getLastConfigIndisponibilityData();

      // assertion
      expect(service.getLastConfig).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        activateMessage: true,
        messageOnLogin: {
          message: 'Message',
          startDate: '2019-09-20',
          startHour: '17:24',
          stopDate: '2019-09-20',
          stopHour: '17:25',
          startRNIPPMessageHour: '',
          stopRNIPPMessageHour: '',
          recipient: false,
        },
      });
    });
  });

  describe('updateConfigWithNewMessage', () => {
    it('should update the configuration.messageOnLogin with form data', async () => {
      // Setup
      const newData = {
        message: 'Hello',
        dateDebut: '2019-09-20',
        dateFin: '2019-09-20',
        heureDebut: '18:24',
        heureFin: '18:25',
        activateMessage: true,
      };

      const user = 'Harry Seldon';
      await service.updateConfigWithNewMessage(newData, user);
      // Expected
      expect(configurationRepositoryMock.save).toHaveBeenCalledTimes(1);
    });
  });
});
