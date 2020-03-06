import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from './config.service';
import { CONFIG_OPTIONS } from './tokens';
import { IsNumber } from 'class-validator';
import {
  InvalidConfigurationError,
  UnkonwnConfigurationNameError,
} from './errors';

class Schema {
  @IsNumber()
  readonly foo: number;
}

describe('ConfigService', () => {
  let service: ConfigService;
  const options = {
    config: {
      foo: 42,
    },
    schema: Schema,
  };

  beforeEach(async () => {
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
    it('should throw if config is not valid', async () => {
      // Given
      const config = {
        foo: 'a string',
      };

      const validate = async () => {
        await service['validate'](config, Schema);
      };
      // Then
      expect(validate()).rejects.toThrow(InvalidConfigurationError);
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
    it('should throw if part is not part of config', () => {
      // Given
      const part = 'bar';
      // Then
      expect(() => service.get(part)).toThrow(UnkonwnConfigurationNameError);
    });
  });
});
