import classnames from 'classnames';
import React, { useContext } from 'react';

import { AppContext } from '@fc/state-management';

import { ReturnButtonComponent } from '../return-button';
import { LayoutHeaderToolsAccountComponent } from './layout-header-tools-account.component';
import { LayoutHeaderToolsLogoutButton } from './layout-header-tools-logout.button';

interface LayoutHeaderToolsComponentProps {
  familyName?: string;
  isModalMenu?: boolean;
  isDesktopViewport?: boolean;
  givenName?: string;
}

export const LayoutHeaderToolsComponent: React.FC<LayoutHeaderToolsComponentProps> = React.memo(
  ({ familyName, givenName, isDesktopViewport, isModalMenu }: LayoutHeaderToolsComponentProps) => {
    const { state } = useContext(AppContext);
    const { endSessionUrl, returnButtonUrl } = state.config.OidcClient.endpoints;

    const isConnected = !!(givenName && familyName);

    return (
      <div
        className={classnames({
          // @NOTE unable to create a eslint rule to match this case
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'fr-header__menu-links': isModalMenu,
          // @NOTE unable to create a eslint rule to match this case
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'fr-header__tools-links': !isModalMenu,
        })}>
        <ul className="fr-btns-group">
          {isDesktopViewport && returnButtonUrl && <ReturnButtonComponent url={returnButtonUrl} />}
          {isConnected && (
            <li>
              <LayoutHeaderToolsAccountComponent
                familyName={familyName}
                givenName={givenName}
                isMobile={isModalMenu || false}
              />
            </li>
          )}
          {isConnected && endSessionUrl && (
            <li>
              <LayoutHeaderToolsLogoutButton
                endSessionUrl={endSessionUrl}
                isMobile={isModalMenu || false}
              />
            </li>
          )}
        </ul>
      </div>
    );
  },
);

LayoutHeaderToolsComponent.defaultProps = {
  familyName: undefined,
  givenName: undefined,
  isDesktopViewport: false,
  isModalMenu: false,
};

LayoutHeaderToolsComponent.displayName = 'LayoutHeaderToolsComponent';
