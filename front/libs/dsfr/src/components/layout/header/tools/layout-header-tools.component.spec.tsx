import { render } from '@testing-library/react';

import { AppContextProvider } from '@fc/state-management';

import { ReturnButtonComponent } from '../return-button';
import { LayoutHeaderToolsComponent } from './layout-header-tools.component';
import { LayoutHeaderToolsAccountComponent } from './layout-header-tools-account.component';
import { LayoutHeaderToolsLogoutButton } from './layout-header-tools-logout.button';

jest.mock('./layout-header-tools-logout.button');
jest.mock('./layout-header-tools-account.component');
jest.mock('../return-button/return-button.component');

describe('LayoutHeaderToolsComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should match the snapshot', () => {
    // given
    const appContextConfigMock = {
      config: {
        OidcClient: { endpoints: { endSessionUrl: undefined, returnButtonUrl: undefined } },
      },
    };
    // when
    const { container } = render(
      <AppContextProvider value={appContextConfigMock}>
        <LayoutHeaderToolsComponent />
      </AppContextProvider>,
    );
    // then
    expect(container).toMatchSnapshot();
  });

  it('should match the snapshot, when isModalMenu is true', () => {
    // given
    const appContextConfigMock = {
      config: {
        OidcClient: { endpoints: { endSessionUrl: undefined, returnButtonUrl: undefined } },
      },
    };
    // when
    const { container } = render(
      <AppContextProvider value={appContextConfigMock}>
        <LayoutHeaderToolsComponent isModalMenu />
      </AppContextProvider>,
    );
    // then
    expect(container).toMatchSnapshot();
  });

  it('should match the snapshot, when isMobile is true and returnButtonUrl is defined', () => {
    // given
    const appContextConfigMock = {
      config: {
        OidcClient: {
          endpoints: { endSessionUrl: undefined, returnButtonUrl: expect.any(String) },
        },
      },
    };
    // when
    const { container } = render(
      <AppContextProvider value={appContextConfigMock}>
        <LayoutHeaderToolsComponent isDesktopViewport />
      </AppContextProvider>,
    );
    // then
    expect(container).toMatchSnapshot();
  });

  it('should match the snapshot, when user is connected but endSessionUrl is not defined', () => {
    // given
    const appContextConfigMock = {
      config: {
        OidcClient: {
          endpoints: { endSessionUrl: undefined, returnButtonUrl: expect.any(String) },
        },
      },
    };
    // when
    const { container } = render(
      <AppContextProvider value={appContextConfigMock}>
        <LayoutHeaderToolsComponent
          familyName="any-familyName-mock"
          givenName="any-givenName-mock"
        />
      </AppContextProvider>,
    );
    // then
    expect(container).toMatchSnapshot();
  });

  it('should match the snapshot, when user is connected and endSessionUrl is defined', () => {
    // given
    const appContextConfigMock = {
      config: {
        OidcClient: {
          endpoints: { endSessionUrl: expect.any(String), returnButtonUrl: expect.any(String) },
        },
      },
    };
    // when
    const { container } = render(
      <AppContextProvider value={appContextConfigMock}>
        <LayoutHeaderToolsComponent
          familyName="any-familyName-mock"
          givenName="any-givenName-mock"
        />
      </AppContextProvider>,
    );
    // then
    expect(container).toMatchSnapshot();
  });

  it('should call LayoutHeaderToolsLogoutButton with props', () => {
    // given
    const appContextConfigMock = {
      config: {
        OidcClient: {
          endpoints: {
            endSessionUrl: 'any-endSessionUrl-mock',
            returnButtonUrl: expect.any(String),
          },
        },
      },
    };
    // when
    render(
      <AppContextProvider value={appContextConfigMock}>
        <LayoutHeaderToolsComponent
          familyName="any-familyName-mock"
          givenName="any-givenName-mock"
        />
      </AppContextProvider>,
    );
    // then
    expect(LayoutHeaderToolsLogoutButton).toHaveBeenCalledTimes(1);
    expect(LayoutHeaderToolsLogoutButton).toHaveBeenCalledWith(
      {
        endSessionUrl: 'any-endSessionUrl-mock',
        isMobile: false,
      },
      {},
    );
  });

  it('should call LayoutHeaderToolsLogoutButton with props, when isModalMenu is true', () => {
    // given
    const appContextConfigMock = {
      config: {
        OidcClient: {
          endpoints: {
            endSessionUrl: 'any-endSessionUrl-mock',
            returnButtonUrl: expect.any(String),
          },
        },
      },
    };
    // when
    render(
      <AppContextProvider value={appContextConfigMock}>
        <LayoutHeaderToolsComponent
          isModalMenu
          familyName="any-familyName-mock"
          givenName="any-givenName-mock"
        />
      </AppContextProvider>,
    );
    // then
    expect(LayoutHeaderToolsLogoutButton).toHaveBeenCalledTimes(1);
    expect(LayoutHeaderToolsLogoutButton).toHaveBeenCalledWith(
      {
        endSessionUrl: 'any-endSessionUrl-mock',
        isMobile: true,
      },
      {},
    );
  });

  it('should match the snapshot, when all props and config are defined', () => {
    // given
    const appContextConfigMock = {
      config: {
        OidcClient: {
          endpoints: { endSessionUrl: expect.any(String), returnButtonUrl: expect.any(String) },
        },
      },
    };
    // when
    const { container } = render(
      <AppContextProvider value={appContextConfigMock}>
        <LayoutHeaderToolsComponent
          isDesktopViewport
          isModalMenu
          familyName="any-familyName-mock"
          givenName="any-givenName-mock"
        />
      </AppContextProvider>,
    );
    // then
    expect(container).toMatchSnapshot();
  });

  it('should call LayoutHeaderToolsAccountComponent with props', () => {
    // given
    const appContextConfigMock = {
      config: {
        OidcClient: { endpoints: { endSessionUrl: undefined, returnButtonUrl: undefined } },
      },
    };
    // when
    render(
      <AppContextProvider value={appContextConfigMock}>
        <LayoutHeaderToolsComponent
          familyName="any-familyName-mock"
          givenName="any-givenName-mock"
        />
      </AppContextProvider>,
    );
    // then
    expect(LayoutHeaderToolsAccountComponent).toHaveBeenCalledTimes(1);
    expect(LayoutHeaderToolsAccountComponent).toHaveBeenCalledWith(
      {
        familyName: 'any-familyName-mock',
        givenName: 'any-givenName-mock',
        isMobile: false,
      },
      {},
    );
  });

  it('should call LayoutHeaderToolsAccountComponent with props when isModalMenu is true', () => {
    // given
    const appContextConfigMock = {
      config: {
        OidcClient: { endpoints: { endSessionUrl: undefined, returnButtonUrl: undefined } },
      },
    };
    // when
    render(
      <AppContextProvider value={appContextConfigMock}>
        <LayoutHeaderToolsComponent
          isModalMenu
          familyName="any-familyName-mock"
          givenName="any-givenName-mock"
        />
      </AppContextProvider>,
    );
    // then
    expect(LayoutHeaderToolsAccountComponent).toHaveBeenCalledTimes(1);
    expect(LayoutHeaderToolsAccountComponent).toHaveBeenCalledWith(
      {
        familyName: 'any-familyName-mock',
        givenName: 'any-givenName-mock',
        isMobile: true,
      },
      {},
    );
  });

  it('should call ReturnButtonComponent', () => {
    // given
    const appContextConfigMock = {
      config: {
        OidcClient: {
          endpoints: { endSessionUrl: undefined, returnButtonUrl: 'any-returnButtonUrl-mock' },
        },
      },
    };
    // when
    render(
      <AppContextProvider value={appContextConfigMock}>
        <LayoutHeaderToolsComponent isDesktopViewport />
      </AppContextProvider>,
    );
    // then
    expect(ReturnButtonComponent).toHaveBeenCalledTimes(1);
    expect(ReturnButtonComponent).toHaveBeenCalledWith({ url: 'any-returnButtonUrl-mock' }, {});
  });
});
