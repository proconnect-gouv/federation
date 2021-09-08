import { DateTime } from 'luxon';

import transformTraceToEnhanced from './transform-trace-to-enhanced';

const trace1 = {
  accountId: 'any-unique-identifier-string-1',
  city: 'Acme City',
  country: 'Acme Country',
  date: '2011-10-05T14:48:00.000Z',
  event: 'FC_REQUESTED_IDP_USERINFO',
  spAcr: 'eidas1',
  spId: '01',
  spName: 'Acme Service Provider',
  trackId: 'trackId-1',
};

describe('transformTraceToEnhanced', () => {
  it('doit retourner un objet avec une propriéte datetime de type luxon', () => {
    // when
    const result = transformTraceToEnhanced(trace1);
    // then
    expect(result).toStrictEqual({
      ...trace1,
      datetime: DateTime.fromISO(trace1.date),
    });
  });
});
