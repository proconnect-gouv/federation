import mockStates from '../../../configs/states';
import getInitialState from './get-initial-state';

jest.mock('../../../configs/states');

describe('getInitialState', () => {
  beforeEach(() => {});

  it('should return an initial state object', () => {
    // when
    const result = getInitialState(mockStates);
    // then
    expect(result).toStrictEqual({
      mockState1: ['default', 'value', '1'],
      mockState2: 'default value 2',
      mockState3: 3,
    });
  });
});
