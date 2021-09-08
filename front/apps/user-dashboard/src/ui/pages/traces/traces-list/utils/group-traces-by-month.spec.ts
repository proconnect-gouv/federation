import { DateTime } from 'luxon';

import groupTracesByMonth, {
  createUniqueGroupKeyFromTraceDate,
} from './group-traces-by-month';

const dateTrace1 = '2011-10-05T14:48:00.000Z';
const trace1 = {
  accountId: 'any-unique-identifier-string-1',
  city: 'Acme City',
  country: 'Acme Country',
  date: dateTrace1,
  datetime: DateTime.fromISO(dateTrace1),
  event: 'FC_REQUESTED_IDP_USERINFO',
  spAcr: 'eidas1',
  spId: '01',
  spName: 'Acme Service Provider',
  trackId: 'trackId-1',
};

const dateTrace2 = '2011-10-06T14:48:00.000Z';
const trace2 = {
  accountId: 'any-unique-identifier-string-2',
  city: 'Acme City',
  country: 'Acme Country',
  date: dateTrace2,
  datetime: DateTime.fromISO(dateTrace2),
  event: 'FC_REQUESTED_IDP_USERINFO',
  spAcr: 'eidas1',
  spId: '02',
  spName: 'Acme Service Provider',
  trackId: 'trackId-2',
};

const dateTrace3 = '2012-10-05T14:48:00.000Z';
const trace3 = {
  accountId: 'any-unique-identifier-string-3',
  city: 'Acme City',
  country: 'Acme Country',
  date: dateTrace3,
  datetime: DateTime.fromISO(dateTrace3),
  event: 'FC_REQUESTED_IDP_USERINFO',
  spAcr: 'eidas1',
  spId: '03',
  spName: 'Acme Service Provider',
  trackId: 'trackId-3',
};

describe('groupTracesByMonth', () => {
  it('doit retourner une trace dans un seul groupe', () => {
    // when
    const results = groupTracesByMonth([], trace1, 0);
    // then
    expect(results.length).toStrictEqual(1);
    expect(results[0][0]).toStrictEqual(1317420000000);
    expect(results[0][1].traces.length).toStrictEqual(1);
    expect(results[0][1].traces[0]).toStrictEqual(trace1);
    expect(results[0][1].label).toStrictEqual('October 2011');
  });

  it('doit retourner deux traces dans un seul groupe', () => {
    // given
    const traces = [trace1, trace2];
    // when
    const results = traces.reduce(groupTracesByMonth, []);
    // then
    expect(results.length).toStrictEqual(1);
    expect(results[0][0]).toStrictEqual(1317420000000);
    expect(results[0][1].traces.length).toStrictEqual(2);
    expect(results[0][1].traces[0]).toStrictEqual(trace1);
    expect(results[0][1].traces[1]).toStrictEqual(trace2);
    expect(results[0][1].label).toStrictEqual('October 2011');
  });

  it('doit retourner trois traces dans deux groupes (2|1)', () => {
    // given
    const traces = [trace1, trace2, trace3];
    // when
    const results = traces.reduce(groupTracesByMonth, []);
    // then
    expect(results.length).toStrictEqual(2);
    // first group
    expect(results[0][0]).toStrictEqual(1317420000000);
    expect(results[0][1].traces.length).toStrictEqual(2);
    expect(results[0][1].traces[0]).toStrictEqual(trace1);
    expect(results[0][1].traces[1]).toStrictEqual(trace2);
    expect(results[0][1].label).toStrictEqual('October 2011');
    // seconds group
    expect(results[1][0]).toStrictEqual(1349042400000);
    expect(results[1][1].traces.length).toStrictEqual(1);
    expect(results[1][1].traces[0]).toStrictEqual(trace3);
    expect(results[1][1].label).toStrictEqual('October 2012');
  });
});

describe('createUniqueGroupKeyFromTraceDate', () => {
  it("doit retourner un timestamp unix(ms) à partir d'un objet date luxon (mois+année)", () => {
    // when
    const result = createUniqueGroupKeyFromTraceDate(trace1);
    // then
    expect(result).toStrictEqual(1317420000000);
  });
});
