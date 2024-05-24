import { render } from '@testing-library/react';

import * as defaultExport from './app-context';

describe('mergeState', () => {
  it('should return an overrided object', () => {
    // given
    const base = {
      config: {
        prop1: 'it will be overriden',
        prop2: 'it will not be merged',
      },
      extraPropertyFromBase: 'it will be merged',
      user: { connected: false },
    };
    const extend = {
      config: {
        prop1: 'it has been overriden',
      },
      extraPropertyFromExtend: 'it will be merged',
      user: { connected: true },
    };
    const result = defaultExport.mergeState(base, extend);
    // then
    expect(result).toStrictEqual({
      config: {
        prop1: 'it has been overriden',
      },
      extraPropertyFromBase: 'it will be merged',
      extraPropertyFromExtend: 'it will be merged',
      user: { connected: true },
    });
  });
});

describe('AppContextProvider', () => {
  // given
  const ChildrenComponentMock = jest.fn(() => <div>mock children</div>);

  it('should have render the children', () => {
    // when
    const { getByText } = render(
      <defaultExport.AppContextProvider value={{}}>
        <ChildrenComponentMock />
      </defaultExport.AppContextProvider>,
    );

    // then
    expect(getByText('mock children')).toBeInTheDocument();
  });

  it('should call mergeState at first render with defaultContext and value argument', () => {
    // given
    const valueMock = expect.any(Object);
    const mergeStateMock = jest.spyOn(defaultExport, 'mergeState');

    // when
    render(
      <defaultExport.AppContextProvider value={valueMock}>
        <ChildrenComponentMock />
      </defaultExport.AppContextProvider>,
    );

    // then
    expect(mergeStateMock).toHaveBeenCalledWith(defaultExport.defaultContext, valueMock);
  });
});
