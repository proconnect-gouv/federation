import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@fc/logger';
import { OverrideCode } from '../helpers';
import { JoseOverrideService } from './jose-override.service';

describe(' JoseOverrideService', () => {
  let service: JoseOverrideService;

  const loggerServiceMock = {
    setContext: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
  };

  const OverrideCodeSpy = jest.spyOn(OverrideCode, 'override');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JoseOverrideService, LoggerService],
    })
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .compile();

    service = module.get<JoseOverrideService>(JoseOverrideService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should call OverrideCode 3 times', () => {
      // Given
      const OVERRIDE_COUNT = 3;
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
});
