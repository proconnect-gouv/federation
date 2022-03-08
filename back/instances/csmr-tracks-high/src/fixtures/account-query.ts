export const accountQueryMock = {
  index: 'indexMockValue',
  body: {
    from: 0,
    sort: [{ date: { order: 'desc' } }],
    query: {
      bool: {
        must: [
          { term: { accountId: 'accountIdMockValue' } },
          { range: { date: { gte: 'now-6M/d', lt: 'now' } } },
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
