import omit from 'lodash.omit';

import { Ministry } from '../../../types';

const cleanMinistries = (ministries: Ministry[]): Partial<Ministry>[] => {
  const cleaned = ministries.map(ministry => {
    return omit(ministry, ['slug']);
  });
  return cleaned;
};

export default cleanMinistries;
