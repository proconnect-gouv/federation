import React from 'react';

import { redirectToExternalUrl } from '@fc/user-dashboard';

interface LayoutHeaderLogoutButtonProps {
  endSessionUrl: string;
}

export const LayoutHeaderLogoutButton = React.memo(
  ({ endSessionUrl }: LayoutHeaderLogoutButtonProps) => {
    const handleLogout = (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      localStorage.clear();
      redirectToExternalUrl(endSessionUrl);
    };

    return (
      <a
        className="fr-btn fr-icon-logout-box-r-line"
        data-testid="layout-header-tools-logout-button"
        href={endSessionUrl}
        title="bouton permettant la déconnexion de votre compte"
        onClick={handleLogout}>
        <span>Se déconnecter</span>
      </a>
    );
  },
);

LayoutHeaderLogoutButton.displayName = 'LayoutHeaderLogoutButton';
