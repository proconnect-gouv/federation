import * as deepFreeze from 'deep-freeze';

/* istanbul ignore file */

import { IIdentityProvider } from '../interface';

export const identityProviderMock: IIdentityProvider = deepFreeze({
  id: 'mock-id-1',
  active: true,
  display: true,
  name: 'mock-identity-provider-name-1',
  title: 'mock-identity-provider-title-1',
} as IIdentityProvider);

export const identityProvidersMock: IIdentityProvider[] = deepFreeze([
  { ...identityProviderMock },
  {
    id: 'mock-id-2',
    active: false,
    display: false,
    name: 'mock-identity-provider-name-2',
    title: 'mock-identity-provider-title-2',
  } as IIdentityProvider,
]);
