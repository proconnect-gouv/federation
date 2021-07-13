/* eslint-disable @typescript-eslint/no-var-requires */
const placeholders = require('../enums/placeholders.enum');

/**
 * @todo Replace the accountId `E000001` by the one of a new unblocked account setted in mongo4/init.d
 * We can't use this one because it has a block attribute that prevents to be tested E2E.
 * @ticket FC-609
 * @date 2021-07-12
 * @author Brice
 */
let count = 0;
const datamock = [
  {
    event: 'FC_REQUESTED_IDP_USERINFO',
    date: placeholders.MORE_THAN_6_MONTHS,
    accountId: 'E000001',
    spId: `00${++count}`,
    spName: 'EDF',
    spAcr: 'eidas1',
    country: 'FR',
    city: 'Paris',
  },
  {
    event: 'not_relevant_event',
    date: placeholders.LESS_THAN_6_MONTHS,
    accountId: 'E000001',
    spId: `00${++count}`,
    spName: 'France Telecom',
    spAcr: 'eidas1',
    country: 'FR',
    city: 'Paris',
  },
  {
    event: 'SP_REQUESTED_FC_USERINFO',
    date: placeholders.LESS_THAN_6_MONTHS,
    accountId: 'E000001',
    spId: `00${++count}`,
    spName: 'LaPoste',
    spAcr: 'eidas1',
    country: 'FR',
    city: 'Paris',
  },
];

module.exports = datamock;
