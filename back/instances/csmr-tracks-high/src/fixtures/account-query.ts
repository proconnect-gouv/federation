/* istanbul ignore file */

// Declarative code
export const accountQueryMock = {
  index: 'indexMockValue',
  body: {
    from: 0,
    sort: [
      {
        date: {
          order: 'desc',
          // official ElasticSearch params
          // eslint-disable-next-line @typescript-eslint/naming-convention
          unmapped_type: 'keyword',
        },
      },
    ],
    query: {
      bool: {
        must: [
          { term: { accountId: 'accountIdMockValue' } },
          { range: { time: { gte: 'now-6M/d', lt: 'now' } } },
          {
            bool: {
              should: [
                {
                  bool: {
                    must: [{ term: { event: 'FC_VERIFIED' } }],
                  },
                },
                {
                  bool: {
                    must: [
                      {
                        term: { event: 'FC_DATATRANSFER:CONSENTIDENTITY' },
                      },
                    ],
                  },
                },
                {
                  bool: {
                    must: [
                      {
                        term: { event: 'FC_DATATRANSFER:CONSENT:DATA' },
                      },
                    ],
                  },
                },
                {
                  bool: {
                    must: [
                      {
                        term: { event: 'DP_REQUESTED_FC_CHECKTOKEN' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  },
};
