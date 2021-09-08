import orderGroupByKeyAsc from './order-group-by-uniqkey';

describe('orderGroupByKeyAsc', () => {
  it('doit retourner un tableau ordonner par la clé unique (timestamp)', () => {
    // given
    const sortable = [[789] as any, [456] as any, [123] as any];
    // when
    const result = sortable.sort(orderGroupByKeyAsc);
    // then
    expect(result).toStrictEqual([[123], [456], [789]]);
  });
});
