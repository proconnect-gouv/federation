import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@fc/logger';
import { OverrideCode } from '@fc/common';
import { CryptographyService } from './cryptography.service';
import { JoseOverrideService } from './jose-override.service';

describe(' JoseOverrideService', () => {
  let service: JoseOverrideService;

  const cryptoHighServiceMock = {
    sign: jest.fn(),
  };

  const loggerServiceMock = {
    setContext: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
  };

  const OverrideCodeSpy = jest.spyOn(OverrideCode, 'override');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CryptographyService, JoseOverrideService, LoggerService],
    })
      .overrideProvider(CryptographyService)
      .useValue(cryptoHighServiceMock)
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .compile();

    service = module.get<JoseOverrideService>(JoseOverrideService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should call OverrideCode 6 times', () => {
      // Given
      const OVERRIDE_COUNT = 6;
      // When
      service.onModuleInit();
      // Then
      expect(OverrideCodeSpy).toHaveBeenCalledTimes(OVERRIDE_COUNT);
    });
  });

  describe('derToJose', () => {
    // Given
    const originalBar = jest.fn();
    const foo = { bar: originalBar };
    const alg = 'foo';
    OverrideCode.wrap(foo, 'bar', 'derToJose');

    it('should await promise and call original', async () => {
      // Given
      const signature = Promise.resolve('signature resolved value');
      // When
      await service['derToJose'](signature, alg);
      // Then
      expect(originalBar).toHaveBeenCalledWith(
        'signature resolved value',
        'foo',
      );
    });
    it('should call directly original', () => {
      // Given
      const signature = 'signature not promise value';
      // When
      service['derToJose'](signature, alg);
      // Then
      expect(originalBar).toHaveBeenCalledWith(signature, 'foo');
    });
    it('should reject exception', () => {
      // Given
      const exception = new Error('test error');
      const signature = Promise.reject(exception);
      // Then
      expect(service['derToJose'](signature, alg)).rejects.toThrow(exception);
    });
    it('should throw catchable exceptions', async () => {
      // Given
      const exception = new Error('test error');
      originalBar.mockImplementation(() => {
        throw exception;
      });
      const signature = Promise.resolve('signature resolved value');
      // When
      try {
        await service['derToJose'](signature, alg);
      } catch (error) {
        // then
        expect(error).toBe(exception);
      }
    });
  });

  describe('encodeBuffer', () => {
    // Given
    const originalBar = jest.fn();
    const foo = { bar: originalBar };
    OverrideCode.wrap(foo, 'bar', 'encodeBuffer');

    it('should await promise and call original', async () => {
      // Given
      const buffer = Promise.resolve('buffer resolved value');
      // When
      await service['encodeBuffer'](buffer);
      // Then
      expect(originalBar).toHaveBeenCalledWith('buffer resolved value');
    });
    it('should call directly original', () => {
      // Given
      const buffer = 'buffer not promise value';
      // When
      service['encodeBuffer'](buffer);
      // Then
      expect(originalBar).toHaveBeenCalledWith(buffer);
    });
    it('should reject exception', () => {
      // Given
      const exception = new Error('test error');
      const buffer = Promise.reject(exception);
      // Then
      expect(service['encodeBuffer'](buffer)).rejects.toThrow(exception);
    });
    it('should throw catchable exceptions', async () => {
      // Given
      const exception = new Error('test error');
      originalBar.mockImplementation(() => {
        throw exception;
      });
      const buffer = Promise.resolve('buffer resolved value');
      // When
      try {
        await service['encodeBuffer'](buffer);
      } catch (error) {
        // then
        expect(error).toBe(exception);
      }
    });
  });

  describe('JWS.compact', () => {
    // Given
    const originalBar = jest.fn();
    const foo = { bar: originalBar };
    const payload = {};
    OverrideCode.wrap(foo, 'bar', 'JWS.compact');

    it('should await promise and call original', async () => {
      // Given
      const recipient: any = [{ signature: Promise.resolve('signature text') }];
      // When
      await service['JWS.compact'](payload, recipient);
      // Then
      expect(originalBar).toHaveBeenCalledWith(payload, [
        { signature: 'signature text' },
      ]);
    });
    it('should call directly original', () => {
      // Given
      const recipient: any = [{ signature: 'signature text' }];
      // When
      service['JWS.compact'](payload, recipient);
      // Then
      expect(originalBar).toHaveBeenCalledWith(payload, [
        { signature: 'signature text' },
      ]);
    });
    it('should reject exception', () => {
      // Given
      const exception = new Error('test error');
      // Given
      const recipient: any = [{ signature: Promise.reject(exception) }];
      // Then
      expect(service['JWS.compact'](payload, recipient)).rejects.toThrow(
        exception,
      );
    });
    it('should throw catchable exceptions', async () => {
      // Given
      const exception = new Error('test error');
      originalBar.mockImplementation(() => {
        throw exception;
      });
      const recipient: any = [{ signature: Promise.resolve('signature text') }];
      // When
      try {
        await service['JWS.compact'](payload, recipient);
      } catch (error) {
        // then
        expect(error).toBe(exception);
      }
    });
  });

  describe('JWK.asKey', () => {
    // Given
    const originalBar = jest.fn();
    const foo = { bar: originalBar };
    const parameters = {};
    const options = {};
    OverrideCode.wrap(foo, 'bar', 'JWK.asKey');

    it('should await promise and call original', async () => {
      // Given
      const key = Promise.resolve('key');
      // When
      await service['JWK.asKey'](key, parameters, options);
      // Then
      expect(originalBar).toHaveBeenCalledWith('key', parameters, options);
    });
    it('should call directly original', () => {
      // Given
      const key = 'key';
      // When
      service['JWK.asKey'](key, parameters, options);
      // Then
      expect(originalBar).toHaveBeenCalledWith('key', parameters, options);
    });
    it('should reject exception', () => {
      // Given
      const exception = new Error('test error');
      const key = Promise.reject(exception);
      // Then
      expect(service['JWK.asKey'](key, parameters, options)).rejects.toThrow(
        exception,
      );
    });
    it('should throw catchable exceptions', async () => {
      // Given
      const exception = new Error('test error');
      originalBar.mockImplementation(() => {
        throw exception;
      });
      const key = Promise.resolve('key');
      // When
      try {
        await service['JWK.asKey'](key, parameters, options);
      } catch (error) {
        // then
        expect(error).toBe(exception);
      }
    });
  });

  describe('JWE.decrypt', () => {
    const resolvedValue = 'resolved value';
    const originalBar = jest.fn().mockResolvedValue(Buffer.from(resolvedValue));
    const foo = {
      bar: originalBar,
    };
    OverrideCode.wrap(foo, 'bar', 'JWE.decrypt');
    const jwe = Symbol('jwe');
    const key = Symbol('key');
    const opts = Symbol('opts');
    it('should return an object with a toString method...', () => {
      // When
      const result = service['JWE.decrypt'](jwe, key, opts);
      // Then
      expect(result).toHaveProperty('toString');
      expect(typeof result.toString).toBe('function');
    });
    it('...that returns a promise', () => {
      // Given
      const object = service['JWE.decrypt'](jwe, key, opts);
      // When
      const result = object.toString();
      // Then
      expect(result instanceof Promise).toBe(true);
    });
    it('... that resolves to wrapped method resolve value', async () => {
      // Given
      const object = service['JWE.decrypt'](jwe, key, opts);
      // When
      const result = await object.toString();
      // Then
      expect(result).toBe(resolvedValue);
    });
  });

  describe('JWA.decrypt', () => {
    // Given
    const originalBar = jest.fn();
    const foo = { bar: originalBar };
    OverrideCode.wrap(foo, 'bar', 'JWA.decrypt');

    const alg = 'alg';
    const ciphertext = 'ciphertext';
    const opts = 'opts';

    it('should await promise and call original', async () => {
      // Given
      const key = Promise.resolve('key');
      // When
      await service['JWA.decrypt'](alg, key, ciphertext, opts);
      // Then
      expect(originalBar).toHaveBeenCalledWith(alg, 'key', ciphertext, opts);
    });
    it('should call directly original', () => {
      // Given
      const key = 'key';
      // When
      service['JWA.decrypt'](alg, key, ciphertext, opts);
      // Then
      expect(originalBar).toHaveBeenCalledWith(alg, 'key', ciphertext, opts);
    });
    it('should reject exception', () => {
      // Given
      const exception = new Error('test error');
      const key = Promise.reject(exception);
      // Then
      expect(
        service['JWA.decrypt'](alg, key, ciphertext, opts),
      ).rejects.toThrow(exception);
    });
    it('should throw catchable exceptions', async () => {
      // Given
      const exception = new Error('test error');
      originalBar.mockImplementation(() => {
        throw exception;
      });
      const key = Promise.resolve('key');
      // When
      try {
        await service['JWA.decrypt'](alg, key, ciphertext, opts);
      } catch (error) {
        // then
        expect(error).toBe(exception);
      }
    });
  });
});
