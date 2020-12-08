import { mocked } from 'ts-jest/utils';
import { Test, TestingModule } from '@nestjs/testing';
import { validateDto } from '@fc/common';
import { ConfigService, validationOptions } from '@fc/config';
import { LoggerService } from '@fc/logger';
import { REDIS_CONNECTION_TOKEN } from '@fc/redis';
import { CryptographyService } from '@fc/cryptography';
import { SESSION_TOKEN_OPTIONS } from './tokens';
import { SessionGenericService } from './session-generic.service';
import { IBoundSessionContext } from './interfaces';
import { SessionBadFormatException } from './exceptions';

jest.mock('@fc/common');

class SchemaMock {}
const sessionOptions = {
  schema: SchemaMock,
};

const configMock = {
  prefix: 'MOCK::SESS::',
  lifetime: 42,
  encryptionKey:
    'U3VyICJBbW9uZyBVcyIsIEJlbmphbWluIGVzdCBzb3V2ZW50IGwnaW1wb3N0ZXVyIDsp',
};
const configServiceMock = {
  get: jest.fn(),
};

const loggerServiceMock = {
  setContext: jest.fn(),
  debug: jest.fn(),
};

const redisServiceMock = {
  get: jest.fn(),
  set: jest.fn(),
  expire: jest.fn(),
  exec: jest.fn(),
  multi: jest.fn(),
};

const cryptographyServiceMock = {
  encryptSymetric: jest.fn(),
  decryptSymetric: jest.fn(),
};

const ctxMock: IBoundSessionContext = {
  sessionId:
    'VGhlIHNwYWNlIHN0YXRpb24gaXMgbG9jYXRlZCBpbiBvcmJpdCBhcm91bmQgdGhlIEVhcnRoIGF0IGFuIGFsdGl0dWRlIG9mIGFwcHJveGltYXRlbHkgNDEwIGttICgyNTAgbWkp',
  moduleName: 'Columbus',
};

const sessionKeyMock = `${configMock.prefix}::${ctxMock.sessionId}`;

const fullSessionMock = {
  Zarya: {
    cargo: 'block',
  },
  Unity: {
    connecting: 'Node 1',
  },
  Zvezda: {
    service: 3,
  },
  Destiny: {
    primaryOperator: 'U.S. Lab',
  },
  Harmony: {
    connecting: 'Node 2',
  },
  Columbus: {
    science: '4all',
  },
  Kiboo: {
    science: 'japan',
  },
};

const getFullSessionMock = jest.fn();
const getSessionKeyMock = jest.fn();

describe('SessionGenericService', () => {
  let service: SessionGenericService;

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionGenericService,
        {
          provide: SESSION_TOKEN_OPTIONS,
          useValue: sessionOptions,
        },
        ConfigService,
        LoggerService,
        {
          provide: REDIS_CONNECTION_TOKEN,
          useValue: redisServiceMock,
        },
        CryptographyService,
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .overrideProvider(CryptographyService)
      .useValue(cryptographyServiceMock)
      .compile();

    service = module.get<SessionGenericService>(SessionGenericService);

    redisServiceMock.multi.mockReturnValueOnce(redisServiceMock);
    configServiceMock.get.mockReturnValueOnce(configMock);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should set the logger context', () => {
    // expect
    expect(loggerServiceMock.setContext).toHaveBeenCalledTimes(1);
    expect(loggerServiceMock.setContext).toHaveBeenCalledWith(
      'SessionGenericService',
    );
  });

  describe('onModuleInit', () => {
    it('should retrieves the configuration', () => {
      // action
      service.onModuleInit();

      // expect
      expect(configServiceMock.get).toHaveBeenCalledTimes(1);
      expect(configServiceMock.get).toHaveBeenCalledWith('SessionGeneric');
    });

    it('should set the "prefix" attribute retrieved from the config', () => {
      // action
      service.onModuleInit();

      // expect
      expect(service['prefix']).toStrictEqual(configMock.prefix);
    });

    it('should set the "encryptionKey" attribute retrieved from the config', () => {
      // action
      service.onModuleInit();

      // expect
      expect(service['encryptionKey']).toStrictEqual(configMock.encryptionKey);
    });

    it('should set the "lifetime" attribute retrieved from the config', () => {
      // action
      service.onModuleInit();

      // expect
      expect(service['lifetime']).toStrictEqual(configMock.lifetime);
    });
  });

  describe('get', () => {
    const getByKeyMock = jest.fn();
    const getModuleMock = jest.fn();

    beforeEach(() => {
      service['getFullSession'] = getFullSessionMock.mockResolvedValueOnce(
        fullSessionMock,
      );
      service['getByKey'] = getByKeyMock.mockReturnValueOnce(
        fullSessionMock.Columbus.science,
      );
      service['getModule'] = getModuleMock.mockReturnValueOnce(
        fullSessionMock.Columbus,
      );
    });

    it('should get the full session object by calling getFullSession', async () => {
      // action
      await service.get(ctxMock);

      // expect
      expect(service['getFullSession']).toHaveBeenCalledTimes(1);
      expect(service['getFullSession']).toHaveBeenCalledWith(ctxMock);
    });

    it('should call getByKey with the context, the full session and the key if the key argument is set', async () => {
      // setup
      const keyMock = 'science';

      // action
      await service.get(ctxMock, keyMock);

      // expect
      expect(service['getByKey']).toHaveBeenCalledTimes(1);
      expect(service['getByKey']).toHaveBeenCalledWith(
        ctxMock,
        fullSessionMock,
        keyMock,
      );
    });

    it('should return the science key from the Colombus module if the key argument is set', async () => {
      // setup
      const keyMock = 'science';

      // action
      const result = await service.get(ctxMock, keyMock);

      // expect
      expect(result).toStrictEqual(fullSessionMock.Columbus.science);
    });

    it('should not call getModule if the key argument is set', async () => {
      // setup
      const keyMock = 'science';

      // action
      await service.get(ctxMock, keyMock);

      // expect
      expect(service['getModule']).toHaveBeenCalledTimes(0);
    });

    it('should call getModule with the context and the full session if the key argument is not set', async () => {
      // action
      await service.get(ctxMock);

      // expect
      expect(service['getModule']).toHaveBeenCalledTimes(1);
      expect(service['getModule']).toHaveBeenCalledWith(
        ctxMock,
        fullSessionMock,
      );
    });

    it('should return the Colombus module if the key argument is not set', async () => {
      // action
      const result = await service.get(ctxMock);

      // expect
      expect(result).toStrictEqual(fullSessionMock.Columbus);
    });

    it('should not call getByKey if the key argument is not set', async () => {
      // action
      await service.get(ctxMock);

      // expect
      expect(service['getByKey']).toHaveBeenCalledTimes(0);
    });
  });

  describe('set', () => {
    const setByKeyMock = jest.fn();
    const setModuleMock = jest.fn();
    const saveMock = jest.fn();

    const sessionToSet = {
      Columbus: {
        science: 'ESA',
      },
    };

    beforeEach(() => {
      service['getFullSession'] = getFullSessionMock.mockResolvedValueOnce(
        fullSessionMock,
      );
      service['setByKey'] = setByKeyMock;
      service['setModule'] = setModuleMock;
      service['save'] = saveMock;
    });

    it('should get the full session object by calling getFullSession', async () => {
      // action
      await service.set(ctxMock, sessionToSet);

      // expect
      expect(service['getFullSession']).toHaveBeenCalledTimes(1);
      expect(service['getFullSession']).toHaveBeenCalledWith(ctxMock);
    });

    it('should call setByKey with the context, the full session, the key to set and the data to set', async () => {
      // action
      await service.set(ctxMock, 'science', sessionToSet.Columbus.science);

      // expect
      expect(service['setByKey']).toHaveBeenCalledTimes(1);
      expect(service['setByKey']).toHaveBeenCalledWith(
        ctxMock,
        fullSessionMock,
        'science',
        sessionToSet.Columbus.science,
      );
    });

    it('should call setModule with the context, the full session and the data to set', async () => {
      // action
      await service.set(ctxMock, sessionToSet.Columbus);

      // expect
      expect(service['setModule']).toHaveBeenCalledTimes(1);
      expect(service['setModule']).toHaveBeenCalledWith(
        ctxMock,
        fullSessionMock,
        sessionToSet.Columbus,
      );
    });

    it('should not call setByKey or setModule if keyOrData is neither a string or an object', async () => {
      // action
      await service.set(ctxMock, undefined);

      // expect
      expect(service['setByKey']).toHaveBeenCalledTimes(0);
      expect(service['setModule']).toHaveBeenCalledTimes(0);
    });

    it('should save the session if the key is set', async () => {
      // action
      await service.set(ctxMock, 'science', sessionToSet.Columbus.science);

      // expect
      expect(service['save']).toHaveBeenCalledTimes(1);
      expect(service['save']).toHaveBeenCalledWith(ctxMock, fullSessionMock);
    });

    it('should save the session if the key is not set', async () => {
      // action
      await service.set(ctxMock, sessionToSet.Columbus);

      // expect
      expect(service['save']).toHaveBeenCalledTimes(1);
      expect(service['save']).toHaveBeenCalledWith(ctxMock, fullSessionMock);
    });

    it('should return the result of the save call', async () => {
      // setup
      const saveResultMock = false;
      saveMock.mockResolvedValueOnce(saveResultMock);

      // action
      const result = await service.set(ctxMock, sessionToSet.Columbus);

      // expect
      expect(result).toStrictEqual(saveResultMock);
    });
  });

  describe('refresh', () => {
    beforeEach(() => {
      service['getSessionKey'] = getSessionKeyMock;

      service.onModuleInit();
    });

    it('should get the sessionKey', async () => {
      // action
      await service.refresh(ctxMock);

      // expect
      expect(getSessionKeyMock).toHaveBeenCalledTimes(1);
      expect(getSessionKeyMock).toHaveBeenCalledWith(ctxMock);
    });

    it('should call expire from redis service with the session key and the session lifetime', async () => {
      // setup
      getSessionKeyMock.mockReturnValueOnce(sessionKeyMock);

      // action
      await service.refresh(ctxMock);

      // expect
      expect(redisServiceMock.expire).toHaveBeenCalledTimes(1);
      expect(redisServiceMock.expire).toHaveBeenCalledWith(
        sessionKeyMock,
        configMock.lifetime,
      );
    });

    it('should return the of the expire call as boolean', async () => {
      // setup
      redisServiceMock.expire.mockResolvedValueOnce(1);

      // action
      const result = await service.refresh(ctxMock);

      // expect
      expect(result).toStrictEqual(true);
    });
  });

  describe('getFullSession', () => {
    const unserializeMock = jest.fn();
    const validateMock = jest.fn();
    const ctxMock: IBoundSessionContext = {
      sessionId: 'sessionId',
      moduleName: 'moduleName',
    };

    beforeEach(() => {
      service['getSessionKey'] = getSessionKeyMock;
      service['unserialize'] = unserializeMock;
      service['validate'] = validateMock;

      service.onModuleInit();
    });

    it('should get the sessionKey', async () => {
      // action
      await service['getFullSession'](ctxMock);

      // expect
      expect(getSessionKeyMock).toHaveBeenCalledTimes(1);
      expect(getSessionKeyMock).toHaveBeenCalledWith(ctxMock);
    });

    it('should get the ciphered session by calling get from the redis service with the session key', async () => {
      // setup
      getSessionKeyMock.mockReturnValueOnce(sessionKeyMock);

      // action
      await service['getFullSession'](ctxMock);

      // expect
      expect(redisServiceMock.get).toHaveBeenCalledTimes(1);
      expect(redisServiceMock.get).toHaveBeenCalledWith(sessionKeyMock);
    });

    it('should return an empty object if no data was returned by redis', async () => {
      // action
      const result = await service['getFullSession'](ctxMock);

      // expect
      expect(result).toStrictEqual({});
    });

    it('should unserialize the ciphered session from redis', async () => {
      // setup
      const cipherMock =
        'VGhlIElTUyBpcyBtYWRlIHVwIG9mIDE2IHByZXNzdXJpemVkIG1vZHVsZXM6IGZvdXIgUnVzc2lhbiBtb2R1bGVzIChQaXJzLCBadmV6ZGEsIFBvaXNrIGFuZCBSYXNzdmV0KSwgbmluZSBVUyBtb2R1bGVzIChaYXJ5YSxbNl0gQkVBTSxbN10gTGVvbmFyZG8sIEhhcm1vbnksIFF1ZXN0LCBUcmFucXVpbGl0eSwgVW5pdHksIEN1cG9sYSwgYW5kIERlc3RpbnkpLCB0d28gSmFwYW5lc2UgbW9kdWxlcyAodGhlIEpFTS1FTE0tUFMgYW5kIEpFTS1QTSkgYW5kIG9uZSBFdXJvcGVhbiBtb2R1bGUgKENvbHVtYnVzKS4g';
      redisServiceMock.get.mockResolvedValueOnce(cipherMock);

      // action
      await service['getFullSession'](ctxMock);

      // expect
      expect(unserializeMock).toHaveBeenCalledTimes(1);
      expect(unserializeMock).toHaveBeenCalledWith(cipherMock);
    });

    it('should validate the unserialized session using the scheme', async () => {
      // setup
      const cipherMock =
        'VGhlIElTUyBpcyBtYWRlIHVwIG9mIDE2IHByZXNzdXJpemVkIG1vZHVsZXM6IGZvdXIgUnVzc2lhbiBtb2R1bGVzIChQaXJzLCBadmV6ZGEsIFBvaXNrIGFuZCBSYXNzdmV0KSwgbmluZSBVUyBtb2R1bGVzIChaYXJ5YSxbNl0gQkVBTSxbN10gTGVvbmFyZG8sIEhhcm1vbnksIFF1ZXN0LCBUcmFucXVpbGl0eSwgVW5pdHksIEN1cG9sYSwgYW5kIERlc3RpbnkpLCB0d28gSmFwYW5lc2UgbW9kdWxlcyAodGhlIEpFTS1FTE0tUFMgYW5kIEpFTS1QTSkgYW5kIG9uZSBFdXJvcGVhbiBtb2R1bGUgKENvbHVtYnVzKS4g';
      redisServiceMock.get.mockResolvedValueOnce(cipherMock);
      unserializeMock.mockReturnValueOnce(fullSessionMock);

      // action
      await service['getFullSession'](ctxMock);

      // expect
      expect(validateMock).toHaveBeenCalledTimes(1);
      expect(validateMock).toHaveBeenCalledWith(fullSessionMock);
    });

    it('should return the full session object', async () => {
      // setup
      const cipherMock =
        'VGhlIElTUyBpcyBtYWRlIHVwIG9mIDE2IHByZXNzdXJpemVkIG1vZHVsZXM6IGZvdXIgUnVzc2lhbiBtb2R1bGVzIChQaXJzLCBadmV6ZGEsIFBvaXNrIGFuZCBSYXNzdmV0KSwgbmluZSBVUyBtb2R1bGVzIChaYXJ5YSxbNl0gQkVBTSxbN10gTGVvbmFyZG8sIEhhcm1vbnksIFF1ZXN0LCBUcmFucXVpbGl0eSwgVW5pdHksIEN1cG9sYSwgYW5kIERlc3RpbnkpLCB0d28gSmFwYW5lc2UgbW9kdWxlcyAodGhlIEpFTS1FTE0tUFMgYW5kIEpFTS1QTSkgYW5kIG9uZSBFdXJvcGVhbiBtb2R1bGUgKENvbHVtYnVzKS4g';
      redisServiceMock.get.mockResolvedValueOnce(cipherMock);
      unserializeMock.mockReturnValueOnce(fullSessionMock);
      validateMock.mockResolvedValueOnce(true);

      // action
      const result = await service['getFullSession'](ctxMock);

      // expect
      expect(result).toStrictEqual(fullSessionMock);
    });

    it('should not catch the error thrown by the validate call', async () => {
      // setup
      const cipherMock =
        'VGhlIElTUyBpcyBtYWRlIHVwIG9mIDE2IHByZXNzdXJpemVkIG1vZHVsZXM6IGZvdXIgUnVzc2lhbiBtb2R1bGVzIChQaXJzLCBadmV6ZGEsIFBvaXNrIGFuZCBSYXNzdmV0KSwgbmluZSBVUyBtb2R1bGVzIChaYXJ5YSxbNl0gQkVBTSxbN10gTGVvbmFyZG8sIEhhcm1vbnksIFF1ZXN0LCBUcmFucXVpbGl0eSwgVW5pdHksIEN1cG9sYSwgYW5kIERlc3RpbnkpLCB0d28gSmFwYW5lc2UgbW9kdWxlcyAodGhlIEpFTS1FTE0tUFMgYW5kIEpFTS1QTSkgYW5kIG9uZSBFdXJvcGVhbiBtb2R1bGUgKENvbHVtYnVzKS4g';
      redisServiceMock.get.mockResolvedValueOnce(cipherMock);
      unserializeMock.mockReturnValueOnce(fullSessionMock);
      const errorMock = new Error('Invalid session');
      validateMock.mockImplementationOnce(() => {
        throw errorMock;
      });

      // expect
      await expect(service['getFullSession'](ctxMock)).rejects.toThrow(
        errorMock,
      );
    });
  });

  describe('getByKey', () => {
    it('should return undefined if the moduleName key is not found', () => {
      // setup
      const ctxMock: IBoundSessionContext = {
        sessionId: 'sessionId',
        moduleName: 'moduleName',
      };

      // action
      const result = service['getByKey'](
        ctxMock,
        fullSessionMock,
        'notGonnaHappens',
      );

      // expect
      expect(result).toStrictEqual(undefined);
    });

    it('should return the value for the given key if the module exists in session', () => {
      // setup
      const ctxMock: IBoundSessionContext = {
        sessionId: 'sessionId',
        moduleName: 'Destiny',
      };

      // action
      const result = service['getByKey'](
        ctxMock,
        fullSessionMock,
        'primaryOperator',
      );

      // expect
      expect(result).toStrictEqual(fullSessionMock.Destiny.primaryOperator);
    });
  });

  describe('getModule', () => {
    it('should return undefined if the moduleName in context is not found', () => {
      // setup
      const ctxMock: IBoundSessionContext = {
        sessionId: 'sessionId',
        moduleName: 'moduleName',
      };

      // action
      const result = service['getModule'](ctxMock, fullSessionMock);

      // expect
      expect(result).toStrictEqual(undefined);
    });

    it('should return the module for the moduleName in context', () => {
      // setup
      const ctxMock: IBoundSessionContext = {
        sessionId: 'sessionId',
        moduleName: 'Destiny',
      };

      // action
      const result = service['getModule'](ctxMock, fullSessionMock);

      // expect
      expect(result).toStrictEqual(fullSessionMock.Destiny);
    });
  });

  describe('setByKey', () => {
    it('should set the module, the key and the data if the moduleName in context is not found', () => {
      // setup
      const setByKeyFullSessionMock = JSON.parse(
        JSON.stringify(fullSessionMock),
      );
      const ctxMock: IBoundSessionContext = {
        sessionId: 'sessionId',
        moduleName: 'Nauka',
      };
      const keyMock = 'research';
      const dataMock = '2021';
      const expected = {
        [keyMock]: dataMock,
      };

      // action
      service['setByKey'](ctxMock, setByKeyFullSessionMock, keyMock, dataMock);

      // expect
      expect(setByKeyFullSessionMock.Nauka).toStrictEqual(expected);
    });

    it('should set the key and the data in the module "moduleName" in context', () => {
      // setup
      const setByKeyFullSessionMock = JSON.parse(
        JSON.stringify(fullSessionMock),
      );
      const ctxMock: IBoundSessionContext = {
        sessionId: 'sessionId',
        moduleName: 'Columbus',
      };
      const keyMock = 'research';
      const dataMock = 'ESA';
      const expected = {
        ...setByKeyFullSessionMock.Columbus,
        [keyMock]: dataMock,
      };

      // action
      service['setByKey'](ctxMock, setByKeyFullSessionMock, keyMock, dataMock);

      // expect
      expect(setByKeyFullSessionMock.Columbus).toStrictEqual(expected);
    });
  });

  describe('setModule', () => {
    it('should set the module, the key and the data if the moduleName in context is not found', () => {
      // setup
      const setModuleFullSessionMock = JSON.parse(
        JSON.stringify(fullSessionMock),
      );
      const ctxMock: IBoundSessionContext = {
        sessionId: 'sessionId',
        moduleName: 'Nauka',
      };
      const keyMock = 'research';
      const dataMock = '2021';
      const expected = {
        [keyMock]: dataMock,
      };

      // action
      service['setModule'](ctxMock, setModuleFullSessionMock, expected);

      // expect
      expect(setModuleFullSessionMock.Nauka).toStrictEqual(expected);
    });

    it('should patch the module with the data if found', () => {
      // setup
      const setModuleFullSessionMock = JSON.parse(
        JSON.stringify(fullSessionMock),
      );
      const ctxMock: IBoundSessionContext = {
        sessionId: 'sessionId',
        moduleName: 'Columbus',
      };
      const keyMock = 'research';
      const dataMock = 'ESA';
      const data = {
        [keyMock]: dataMock,
      };
      const expected = {
        ...setModuleFullSessionMock.Columbus,
        [keyMock]: dataMock,
      };

      // action
      service['setModule'](ctxMock, setModuleFullSessionMock, data);

      // expect
      expect(setModuleFullSessionMock.Columbus).toStrictEqual(expected);
    });
  });

  describe('save', () => {
    const serializeMock = jest.fn();
    const ctxMock: IBoundSessionContext = {
      sessionId: 'sessionId',
      moduleName: 'moduleName',
    };

    beforeEach(() => {
      service['getSessionKey'] = getSessionKeyMock;
      service['serialize'] = serializeMock;

      service.onModuleInit();
    });

    it('should get the sessionKey', async () => {
      // action
      await service['save'](ctxMock, fullSessionMock);

      // expect
      expect(getSessionKeyMock).toHaveBeenCalledTimes(1);
      expect(getSessionKeyMock).toHaveBeenCalledWith(ctxMock);
    });

    it('should serialize the data', async () => {
      // action
      await service['save'](ctxMock, fullSessionMock);

      // expect
      expect(serializeMock).toHaveBeenCalledTimes(1);
      expect(serializeMock).toHaveBeenCalledWith(fullSessionMock);
    });

    it('should initialize a redis bulk operation', async () => {
      // action
      await service['save'](ctxMock, fullSessionMock);

      // expect
      expect(redisServiceMock.multi).toHaveBeenCalledTimes(1);
      expect(redisServiceMock.multi).toHaveBeenCalledWith();
    });

    it('should initialize a redis set operation within the bulk with the session key and the serialiazed data', async () => {
      // setup
      getSessionKeyMock.mockReturnValueOnce(sessionKeyMock);
      const mockSerializedData =
        'VGhlIGFzc2VtYmx5IG9mIHRoZSBJbnRlcm5hdGlvbmFsIFNwYWNlIFN0YXRpb24sIGEgbWFqb3IgZW5kZWF2b3VyIGluIHNwYWNlIGFyY2hpdGVjdHVyZSwgYmVnYW4gaW4gTm92ZW1iZXIgMTk5OC5bM10gUnVzc2lhbiBtb2R1bGVzIGxhdW5jaGVkIGFuZCBkb2NrZWQgcm9ib3RpY2FsbHksIHdpdGggdGhlIGV4Y2VwdGlvbiBvZiBSYXNzdmV0LiBBbGwgb3RoZXIgbW9kdWxlcyB3ZXJlIGRlbGl2ZXJlZCBieSB0aGUgU3BhY2UgU2h1dHRsZS4KCg==';
      serializeMock.mockReturnValueOnce(mockSerializedData);

      // action
      await service['save'](ctxMock, fullSessionMock);

      // expect
      expect(redisServiceMock.set).toHaveBeenCalledTimes(1);
      expect(redisServiceMock.set).toHaveBeenCalledWith(
        sessionKeyMock,
        mockSerializedData,
      );
    });

    it('should initialize a redis expire operation within the bulk with the session key and the session lifetime', async () => {
      // setup
      getSessionKeyMock.mockReturnValueOnce(sessionKeyMock);

      // action
      await service['save'](ctxMock, fullSessionMock);

      // expect
      expect(redisServiceMock.expire).toHaveBeenCalledTimes(1);
      expect(redisServiceMock.expire).toHaveBeenCalledWith(
        sessionKeyMock,
        configMock.lifetime,
      );
    });

    it('should execute the bulk operation', async () => {
      // action
      await service['save'](ctxMock, fullSessionMock);

      // expect
      expect(redisServiceMock.exec).toHaveBeenCalledTimes(1);
      expect(redisServiceMock.exec).toHaveBeenCalledWith();
    });

    it('should return the boolean casted result of the bulk operation execution', async () => {
      // setup
      redisServiceMock.exec.mockResolvedValueOnce(1);

      // action
      const result = await service['save'](ctxMock, fullSessionMock);

      // expect
      expect(result).toStrictEqual(true);
    });
  });

  describe('serialize', () => {
    beforeEach(() => {
      service.onModuleInit();
    });

    it('should call encryptSymetric from cryptography service with the cryptographic key and JSON stringified session', () => {
      // setup
      const stringifiedFullSessionMock = JSON.stringify(fullSessionMock);

      // action
      service['serialize'](fullSessionMock);

      // expect
      expect(cryptographyServiceMock.encryptSymetric).toHaveBeenCalledTimes(1);
      expect(cryptographyServiceMock.encryptSymetric).toHaveBeenCalledWith(
        configMock.encryptionKey,
        stringifiedFullSessionMock,
      );
    });

    it('should return the ciphered session', () => {
      // setup
      const cipherMock =
        'VGhlIGZpcnN0IHJlc2lkZW50IGNyZXcsIEV4cGVkaXRpb24gMSwgYXJyaXZlZCBpbiBOb3ZlbWJlciAyMDAwIG9uIFNveXV6IFRNLTMxLiBBdCB0aGUgZW5kIG9mIHRoZSBmaXJzdCBkYXkgb24gdGhlIHN0YXRpb24sIGFzdHJvbmF1dCBCaWxsIFNoZXBoZXJkIHJlcXVlc3RlZCB0aGUgdXNlIG9mIHRoZSByYWRpbyBjYWxsIHNpZ24gIkFscGhhIiwgd2hpY2ggaGUgYW5kIGNvc21vbmF1dCBLcmlrYWxldiBwcmVmZXJyZWQgdG8gdGhlIG1vcmUgY3VtYmVyc29tZSAiSW50ZXJuYXRpb25hbCBTcGFjZSBTdGF0aW9uIi4=';
      cryptographyServiceMock.encryptSymetric.mockReturnValueOnce(cipherMock);

      // action
      const result = service['serialize'](fullSessionMock);

      // expect
      expect(result).toStrictEqual(cipherMock);
    });
  });

  describe('unserialize', () => {
    const cipherMock =
      'VGhlIGZpcnN0IHJlc2lkZW50IGNyZXcsIEV4cGVkaXRpb24gMSwgYXJyaXZlZCBpbiBOb3ZlbWJlciAyMDAwIG9uIFNveXV6IFRNLTMxLiBBdCB0aGUgZW5kIG9mIHRoZSBmaXJzdCBkYXkgb24gdGhlIHN0YXRpb24sIGFzdHJvbmF1dCBCaWxsIFNoZXBoZXJkIHJlcXVlc3RlZCB0aGUgdXNlIG9mIHRoZSByYWRpbyBjYWxsIHNpZ24gIkFscGhhIiwgd2hpY2ggaGUgYW5kIGNvc21vbmF1dCBLcmlrYWxldiBwcmVmZXJyZWQgdG8gdGhlIG1vcmUgY3VtYmVyc29tZSAiSW50ZXJuYXRpb25hbCBTcGFjZSBTdGF0aW9uIi4=';

    beforeEach(() => {
      service.onModuleInit();
    });

    it('should call decryptSymetric from cryptography service with the cryptographic key and ciphered session', () => {
      // setup
      const stringifiedFullSessionMock = JSON.stringify(fullSessionMock);
      cryptographyServiceMock.decryptSymetric.mockReturnValueOnce(
        stringifiedFullSessionMock,
      );

      // action
      service['unserialize'](cipherMock);

      // expect
      expect(cryptographyServiceMock.decryptSymetric).toHaveBeenCalledTimes(1);
      expect(cryptographyServiceMock.decryptSymetric).toHaveBeenCalledWith(
        configMock.encryptionKey,
        cipherMock,
      );
    });

    it('should return the JSON parsed session', () => {
      // setup
      const stringifiedFullSessionMock = JSON.stringify(fullSessionMock);
      cryptographyServiceMock.decryptSymetric.mockReturnValueOnce(
        stringifiedFullSessionMock,
      );

      // action
      const result = service['unserialize'](cipherMock);

      // expect
      expect(result).toStrictEqual(fullSessionMock);
    });

    it('should throw if the session is unparsable', () => {
      // setup
      const stringifiedFullSessionMock = 'what ?';
      cryptographyServiceMock.decryptSymetric.mockReturnValueOnce(
        stringifiedFullSessionMock,
      );

      // action / expect
      expect(() => service['unserialize'](cipherMock)).toThrowError(
        SessionBadFormatException,
      );
    });
  });

  describe('validate', () => {
    const validateDtoMock = mocked(validateDto, true);

    beforeEach(() => {
      service.onModuleInit();
    });

    it('should validate the session using the DTO provided in for the instance and validation options from config service', async () => {
      // action
      await service['validate'](fullSessionMock);

      // expect
      expect(validateDtoMock).toHaveBeenCalledTimes(1);
      expect(validateDtoMock).toHaveBeenCalledWith(
        fullSessionMock,
        SchemaMock,
        validationOptions,
      );
    });

    it('should throw if the validate fails', async () => {
      // setup
      const errorMock = new Error('Fumble !');
      validateDtoMock.mockRejectedValueOnce(errorMock);

      // action / expect
      await expect(service['validate'](fullSessionMock)).rejects.toThrow(
        errorMock,
      );
    });
  });

  describe('getSessionKey', () => {
    beforeEach(() => {
      service.onModuleInit();
    });

    it('should return the session key using the prefix and the session id', () => {
      // action
      const result = service['getSessionKey'](ctxMock);

      // expect
      expect(result).toStrictEqual(sessionKeyMock);
    });
  });
});
