/* istanbul ignore file */

// Declarative code
import { ObjectID } from 'mongodb';

import { IClaims } from '../interface';

export const claimMock: IClaims = {
  id: new ObjectID('5d9c677da8bb151b00720451'),
  name: 'amr',
};

export const claimsListMock: IClaims[] = [
  {
    id: new ObjectID('5d9c677da8bb151b00720451'),
    name: 'amr',
  },
];
