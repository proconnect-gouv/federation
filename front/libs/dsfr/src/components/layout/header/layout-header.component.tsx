import React, { useCallback, useContext, useState } from 'react';
import { useMediaQuery } from 'react-responsive';

import { UserInfosContext, UserInterface } from '@fc/oidc-client';
import { AppContext, AppContextInterface } from '@fc/state-management';

import { LayoutHeaderMobileBurgerButton } from './layout-header-mobile-burger.button';
import { LayoutHeaderLogosComponent } from './logos';
import { LayoutHeaderMenuComponent } from './menu';
import { ReturnButtonComponent } from './return-button';
import { LayoutHeaderToolsComponent } from './tools';

export const LayoutHeaderComponent = React.memo(() => {
  const [mobileMenuOpened, setMobileMenuOpened] = useState(false);
  const ltDesktop = useMediaQuery({ query: '(max-width: 992px)' });

  const { connected, ready, userinfos } = useContext<UserInterface>(UserInfosContext);
  const isUserConnected = connected && ready;

  // oidc spec defined property
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const givenName = userinfos?.given_name;
  // oidc spec defined property
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const familyName = userinfos?.family_name;

  const { state } = useContext<AppContextInterface>(AppContext);
  const { logo, navigationItems } = state.config.Layout;
  const { returnButtonUrl } = state.config.OidcClient.endpoints;

  /* @NOTE can not be mocked without a native re-implementation */
  /* istanbul ignore next */
  const toggleMobileMenu = useCallback(() => {
    /* @NOTE can not be mocked without a native re-implementation */
    /* istanbul ignore next */
    setMobileMenuOpened((prev: boolean) => !prev);
  }, []);

  return (
    <React.Fragment>
      <header className="fr-header" role="banner">
        <div className="fr-header__body">
          <div className="fr-container">
            <div className="fr-header__body-row">
              <div className="fr-header__brand fr-enlarge-link">
                <div className="fr-header__brand-top">
                  <LayoutHeaderLogosComponent logo={logo} />
                  {isUserConnected && (
                    // @NOTE Mobile buger button
                    // used to show/hide Mobile modal menu
                    <LayoutHeaderMobileBurgerButton
                      opened={mobileMenuOpened}
                      onOpen={toggleMobileMenu}
                    />
                  )}
                </div>
              </div>
              <div className="fr-header__tools">
                {/* @NOTE Used to show
                  - user's givenname/familyname
                  - the return button (desktop only) */}
                <LayoutHeaderToolsComponent
                  familyName={familyName}
                  givenName={givenName}
                  isDesktopViewport={!ltDesktop}
                  isModalMenu={false}
                />
              </div>
            </div>
          </div>
        </div>
        {isUserConnected && (
          // @NOTE Used to show
          // - Mobile modal menu
          // - Desktop pages navigation bar (inline menu)
          <LayoutHeaderMenuComponent
            familyName={familyName}
            givenName={givenName}
            navigationItems={navigationItems}
            opened={mobileMenuOpened}
            onClose={toggleMobileMenu}
          />
        )}
      </header>
      {ltDesktop && <ReturnButtonComponent isMobileViewport url={returnButtonUrl} />}
    </React.Fragment>
  );
});

LayoutHeaderComponent.displayName = 'LayoutHeaderComponent';
