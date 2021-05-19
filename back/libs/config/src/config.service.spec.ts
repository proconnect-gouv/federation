import { mocked } from 'ts-jest/utils';
import { readFileSync } from 'fs';
import { IsNumber, IsObject } from 'class-validator';
import { Test, TestingModule } from '@nestjs/testing';
import { Type } from '@nestjs/common';
import { HttpsOptions } from '@nestjs/common/interfaces/external/https-options.interface';
import { ConfigService } from './config.service';
import { CONFIG_OPTIONS } from './tokens';
import { UnknownConfigurationNameError } from './errors';

jest.mock('fs', () => ({
  readFileSync: jest.fn(),
}));
class Schema {
  @IsNumber()
  readonly foo: number;

  @IsObject()
  readonly I: any;
}

describe('ConfigService', () => {
  let service: ConfigService;
  const options = {
    config: {
      foo: 42,
      I: {
        swear: {
          my: {
            intentions: {
              are: {
                bad: 'Harry',
              },
            },
          },
        },
      },
    },
    schema: Schema,
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
        {
          provide: CONFIG_OPTIONS,
          useValue: options,
        },
      ],
    }).compile();
    service = module.get<ConfigService>(ConfigService);
  });

  describe('constructor', () => {
    it('should be defined', () => {
      // Then
      expect(service).toBeDefined();
    });
  });

  describe('validate', () => {
    it('should exit and give feed back if config is not valid', () => {
      // Given
      const config = {
        foo: 'a string instead of a number',
      };
      const processExit = jest
        .spyOn(process, 'exit')
        .mockImplementation((code) => code as never);
      const consoleError = jest
        .spyOn(console, 'error')
        .mockImplementation((log) => log);

      // When
      ConfigService['validate'](config, Schema);

      // Then
      expect(processExit).toHaveBeenCalledWith(1);
      expect(consoleError).toHaveBeenCalledTimes(3);
      expect(consoleError).toHaveBeenCalledWith('Invalid configuration Error');
      expect(consoleError).toHaveBeenCalledWith('Exiting app');
    });
  });

  describe('get', () => {
    it('should return asked part of config', () => {
      // Given
      const part = 'foo';
      // When
      const config = service.get(part);
      // Then
      expect(config).toBe(options.config.foo);
    });
    it('should return asked part of config based on dot paths', () => {
      //Given
      const paths = 'I.swear.my.intentions.are.bad';

      // When
      const config = service.get(paths);

      // Then
      expect(config).toBe(options.config.I.swear.my.intentions.are.bad);
    });
    it('should throw if path is not part of config', () => {
      // Given
      const part = 'bar';
      // Then
      expect(() => service.get(part)).toThrow(UnknownConfigurationNameError);
    });
    it('should throw if path is not a string', () => {
      // Given
      const part = 42;
      // Then
      expect(() => service.get((part as unknown) as string)).toThrow(
        UnknownConfigurationNameError,
      );
    });
    it('should throw if path is undefined', () => {
      // Given
      const part = undefined;
      // Then
      expect(() => service.get(part)).toThrow(UnknownConfigurationNameError);
    });

    it('should throw if path is empty', () => {
      // Given
      const part = '';
      // Then
      expect(() => service.get(part)).toThrow(UnknownConfigurationNameError);
    });
    it("should throw if paths don't exist in config", () => {
      // Given
      const paths = 'I.swear.my.intentions.are.bad.harry.potter';

      // When
      // Then
      expect(() => service.get(paths)).toThrow(UnknownConfigurationNameError);
    });
  });

  describe('getHttpsOptions()', () => {
    let getHttpsMock;
    beforeEach(() => {
      getHttpsMock = jest.spyOn<Type<ConfigService>, any>(
        ConfigService,
        'getHttpsCert',
      );

      jest
        .spyOn<Type<ConfigService>, any>(ConfigService, 'validate')
        .mockImplementationOnce(() => {
          return 'initially true';
        });
    });

    afterEach(() => {
      // clean
      process.env.App_HTTPS_SERVER_KEY = undefined;
      process.env.App_HTTPS_SERVER_CERT = undefined;
    });

    it('should get HTTPS options from env variable', () => {
      // Given
      process.env.App_HTTPS_SERVER_KEY = 'App_HTTPS_SERVER_KEYValue';
      process.env.App_HTTPS_SERVER_CERT = 'App_HTTPS_SERVER_CERTValue';

      const resultMock: HttpsOptions = {
        key: 'keyValue',
        cert: 'certValue',
      };

      getHttpsMock
        .mockImplementationOnce(() => resultMock.key)
        .mockImplementationOnce(() => resultMock.cert);

      // When
      const options = ConfigService.getHttpsOptions();

      // Then
      expect(options).toStrictEqual<HttpsOptions>(resultMock);
    });

    it('should get null if HTTPS protocol is deactivated', () => {
      // Given
      process.env.App_HTTPS_SERVER_KEY = '';
      process.env.App_HTTPS_SERVER_CERT = '';

      // When
      const options = ConfigService.getHttpsOptions();

      // Then
      expect(options).toBe(null);
      expect(getHttpsMock).not.toHaveBeenCalled();
    });

    it('should throw an error if protocol is unknown', () => {
      // Given
      process.env.App_HTTPS_SERVER_KEY = 'keyValue';
      process.env.App_HTTPS_SERVER_CERT = 'certValue';

      const errorMock = new Error('File Incorrect');
      getHttpsMock.mockImplementationOnce(() => {
        throw errorMock;
      });

      // When
      expect(
        () => ConfigService.getHttpsOptions(),
        // Then
      ).toThrow(errorMock);
    });
  });

  describe('getHttpsCert()', () => {
    const pathMock = '/file/should/exist/for/key.crt';
    let readFileSyncMock: jest.Mock;
    beforeEach(() => {
      readFileSyncMock = mocked(readFileSync);
    });
    it('should get certificat at the path', () => {
      // Given
      const resultMock = 'certificatValue';
      readFileSyncMock.mockReturnValueOnce(resultMock);

      // When
      const result = ConfigService['getHttpsCert'](pathMock);

      // Then
      expect(result).toBe(resultMock);
      expect(readFileSyncMock).toBeCalledTimes(1);
      expect(readFileSyncMock).toHaveBeenCalledWith(pathMock, 'utf-8');
    });
    it('should throw an error if file is known', () => {
      // Given
      const errorMock = new Error('File Incorrect');
      readFileSyncMock.mockImplementationOnce(() => {
        throw errorMock;
      });

      // When
      expect(
        () => ConfigService['getHttpsCert'](pathMock),
        // Then
      ).toThrow(
        'No HTTPS Certificate found at path : /file/should/exist/for/key.crt',
      );
    });
  });
});
