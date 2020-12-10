import { ACTION_TYPES } from '../../constants';
import identityProvidersHistory from './identity-providers-history';

describe('identityProvidersHistory', () => {
  describe('ACTION_TYPES.IDENTITY_PROVIDER_ADD', () => {
    it('add uid at the start of reducer', () => {
      const state = ['mock-2', 'mock-3'];
      const action = {
        payload: 'mock-1',
        type: ACTION_TYPES.IDENTITY_PROVIDER_ADD,
      };
      const result = identityProvidersHistory(state, action);
      expect(result).toStrictEqual(['mock-1', 'mock-2', 'mock-3']);
    });

    it('add uid at the start of reducer, remove fourth value', () => {
      const state = ['mock-2', 'mock-3', 'mock-4'];
      const action = {
        payload: 'mock-1',
        type: ACTION_TYPES.IDENTITY_PROVIDER_ADD,
      };
      const result = identityProvidersHistory(state, action);
      expect(result).toStrictEqual(['mock-1', 'mock-2', 'mock-3']);
    });
  });

  describe('ACTION_TYPES.IDENTITY_PROVIDER_REMOVE', () => {
    it('remove an uid from the reducer', () => {
      const state = ['mock-1', 'mock-2', 'mock-3'];
      const action = {
        payload: 'mock-1',
        type: ACTION_TYPES.IDENTITY_PROVIDER_REMOVE,
      };
      const result = identityProvidersHistory(state, action);
      expect(result).toStrictEqual(['mock-2', 'mock-3']);
    });

    it('remove nothing from the reducer, if uid not exists', () => {
      const state = ['mock-1', 'mock-2', 'mock-3'];
      const action = {
        payload: 'mock-mock-mock',
        type: ACTION_TYPES.IDENTITY_PROVIDER_REMOVE,
      };
      const result = identityProvidersHistory(state, action);
      expect(result).toStrictEqual(['mock-1', 'mock-2', 'mock-3']);
    });
  });

  describe('ACTION_TYPES.MINISTRY_LIST_LOAD_COMPLETED', () => {
    it('remove unloaded uid/fi', () => {
      const state = ['mock-1', 'mock-2', 'mock-3'];
      const action = {
        payload: {
          ministries: [
            {
              id: 'mock-ministry',
              identityProviders: [
                {
                  active: true,
                  name: 'mock-fi-1',
                  uid: 'mock-1',
                },
              ],
              name: 'Mock ministry',
            },
          ],
        },
        type: ACTION_TYPES.MINISTRY_LIST_LOAD_COMPLETED,
      };
      const result = identityProvidersHistory(state, action);
      expect(result).toStrictEqual(['mock-1']);
    });
  });
});
