import { orderTracesByDateAsc } from './order-traces-by-date';

describe('orderTracesByDateAsc', () => {
  it('doit retourner un tableau ordonner par la clé unique (timestamp)', () => {
    // given
    const sortable = [
      { date: '2012-10-06T14:48:00.000Z' } as any,
      { date: '2011-10-05T14:48:00.000Z' } as any,
      { date: '2012-10-05T14:48:00.000Z' } as any,
    ];
    // when
    const result = sortable.sort(orderTracesByDateAsc);
    // then
    expect(result).toStrictEqual([
      { date: '2012-10-06T14:48:00.000Z' },
      { date: '2012-10-05T14:48:00.000Z' },
      { date: '2011-10-05T14:48:00.000Z' },
    ]);
  });
});
