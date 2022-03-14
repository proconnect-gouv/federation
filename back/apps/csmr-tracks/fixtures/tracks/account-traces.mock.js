/* eslint-disable @typescript-eslint/no-var-requires */
const placeholders = require('../enums/placeholders.enum');

const accountId = 'test_TRACE_USER';
let count = 0;
const datamock = [
  {
    event: 'FC_DATATRANSFER:CONSENTIDENTITY',
    date: placeholders.MORE_THAN_6_MONTHS,
    accountId,
    spId: `00${++count}`,
    spName: 'ShouldNotAppear',
    spAcr: 'eidas1',
    country: 'FR',
    city: 'Paris',
  },
  {
    event: 'FC_DATATRANSFER:CONSENTIDENTITY',
    date: placeholders.LESS_THAN_6_MONTHS,
    accountId,
    spId: `00${++count}`,
    spName: 'Engie',
    spAcr: 'eidas2',
    country: 'FR',
    city: 'Paris',
  },
  {
    event: 'FC_DATATRANSFER:CONSENT:DATA',
    date: placeholders.LESS_THAN_6_MONTHS,
    accountId,
    spId: `00${++count}`,
    spName: 'Orange Mobile',
    spAcr: 'eidas3',
    country: 'FR',
    city: 'Paris',
  },
  {
    event: 'FC_VERIFIED',
    date: placeholders.LESS_THAN_6_MONTHS,
    accountId,
    spId: `00${++count}`,
    spName: 'LaPoste',
    spAcr: 'eidas3',
    country: 'FR',
    city: 'Paris',
  },
];

module.exports = datamock;
