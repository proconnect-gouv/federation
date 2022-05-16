import { render } from '@testing-library/react';
import { useMediaQuery } from 'react-responsive';
import { mocked } from 'ts-jest/utils';

import { UserInfosContext, UserInterface } from '@fc/oidc-client';
import { AppContextProvider } from '@fc/state-management';

import { LayoutHeaderComponent } from './layout-header.component';
import { LayoutHeaderMobileBurgerButton } from './layout-header-mobile-burger.button';
import { LayoutHeaderLogosComponent } from './logos';
import { LayoutHeaderMenuComponent } from './menu';
import { ReturnButtonComponent } from './return-button';
import { LayoutHeaderToolsComponent } from './tools';

jest.mock('./tools/layout-header-tools.component');
jest.mock('./logos/layout-header-logos.component');
jest.mock('./menu/layout-header-menu.component');
jest.mock('./layout-header-mobile-burger.button');
jest.mock('./return-button/return-button.component');

describe('LayoutHeaderComponent', () => {
  // given
  const navigationItemsMock = [
    { a11y: 'any-a11y-mock-1', href: 'any-href-mock-1', label: 'any-label-mock-1' },
    { a11y: 'any-a11y-mock-2', href: 'any-href-mock-2', label: 'any-label-mock-2' },
  ];

  const userInfosContextMock = {
    connected: false,
    ready: false,
    userinfos: {
      // oidc spec defined property
      // eslint-disable-next-line @typescript-eslint/naming-convention
      family_name: expect.any(String),
      // oidc spec defined property
      // eslint-disable-next-line @typescript-eslint/naming-convention
      given_name: expect.any(String),
    },
  } as unknown as UserInterface;

  const appContextConfigMock = {
    config: {
      Layout: {
        logo: 'any-logo-mock',
        navigationItems: navigationItemsMock,
      },
      OidcClient: { endpoints: {} },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should match the snapshot', () => {
    // when
    const { container } = render(
      <AppContextProvider value={appContextConfigMock}>
        <LayoutHeaderComponent />
      </AppContextProvider>,
    );
    // then
    expect(container).toMatchSnapshot();
  });

  it('should match the snapshot, when user is connected', () => {
    // given
    const uInfosContextMock = { ...userInfosContextMock, connected: true, ready: true };
    // when
    const { container } = render(
      <UserInfosContext.Provider value={uInfosContextMock}>
        <AppContextProvider value={appContextConfigMock}>
          <LayoutHeaderComponent />
        </AppContextProvider>
      </UserInfosContext.Provider>,
    );
    // then
    expect(container).toMatchSnapshot();
  });

  it('should call LayoutHeaderLogosComponent with params', () => {
    // when
    render(
      <AppContextProvider value={appContextConfigMock}>
        <LayoutHeaderComponent />
      </AppContextProvider>,
    );
    // then
    expect(LayoutHeaderLogosComponent).toHaveBeenCalledTimes(1);
    expect(LayoutHeaderLogosComponent).toHaveBeenCalledWith({ logo: 'any-logo-mock' }, {});
  });

  it('should call LayoutHeaderMobileBurgerButton with params when user is connected', () => {
    // given
    const uInfosContextMock = { ...userInfosContextMock, connected: true, ready: true };
    // when
    render(
      <UserInfosContext.Provider value={uInfosContextMock}>
        <AppContextProvider value={appContextConfigMock}>
          <LayoutHeaderComponent />
        </AppContextProvider>
      </UserInfosContext.Provider>,
    );
    // then
    expect(LayoutHeaderMobileBurgerButton).toHaveBeenCalledTimes(1);
    expect(LayoutHeaderMobileBurgerButton).toHaveBeenCalledWith(
      { onOpen: expect.any(Function), opened: false },
      {},
    );
  });

  it('should call LayoutHeaderToolsComponent with params when user is connected', () => {
    // given
    const uInfosContextMock = { ...userInfosContextMock, connected: true, ready: true };
    // when
    render(
      <UserInfosContext.Provider value={uInfosContextMock}>
        <AppContextProvider value={appContextConfigMock}>
          <LayoutHeaderComponent />
        </AppContextProvider>
      </UserInfosContext.Provider>,
    );
    // then
    expect(LayoutHeaderToolsComponent).toHaveBeenCalledTimes(1);
    expect(LayoutHeaderToolsComponent).toHaveBeenCalledWith(
      {
        familyName: expect.any(String),
        givenName: expect.any(String),
        isDesktopViewport: false,
        isModalMenu: false,
      },
      {},
    );
  });

  it('should call LayoutHeaderMenuComponent with params when user is connected', () => {
    // given
    const uInfosContextMock = { ...userInfosContextMock, connected: true, ready: true };
    // when
    render(
      <UserInfosContext.Provider value={uInfosContextMock}>
        <AppContextProvider value={appContextConfigMock}>
          <LayoutHeaderComponent />
        </AppContextProvider>
      </UserInfosContext.Provider>,
    );
    // then
    expect(LayoutHeaderMenuComponent).toHaveBeenCalledTimes(1);
    expect(LayoutHeaderMenuComponent).toHaveBeenCalledWith(
      {
        familyName: expect.any(String),
        givenName: expect.any(String),
        navigationItems: navigationItemsMock,
        onClose: expect.any(Function),
        opened: false,
      },
      {},
    );
  });

  it('should call ReturnButtonComponent into a mobile viewport', () => {
    // given
    mocked(useMediaQuery).mockReturnValueOnce(true);
    const uInfosContextMock = { ...userInfosContextMock, connected: true, ready: true };
    // when
    render(
      <UserInfosContext.Provider value={uInfosContextMock}>
        <AppContextProvider value={appContextConfigMock}>
          <LayoutHeaderComponent />
        </AppContextProvider>
      </UserInfosContext.Provider>,
    );
    // then
    expect(ReturnButtonComponent).toHaveBeenCalledTimes(1);
  });
});
