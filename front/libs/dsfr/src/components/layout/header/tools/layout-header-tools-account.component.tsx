import React from 'react';

interface LayoutHeaderToolsAccountComponentProps {
  familyName: string;
  isMobile: boolean;
  givenName: string;
}

export const LayoutHeaderToolsAccountComponent: React.FC<LayoutHeaderToolsAccountComponentProps> =
  React.memo(({ familyName, givenName, isMobile }: LayoutHeaderToolsAccountComponentProps) => {
    const dataTestId = isMobile
      ? 'layout-header-tools-account-component-mobile'
      : 'layout-header-tools-account-component-desktop';
    return (
      <span className="fr-btn fr-fi-account-line" data-testid={dataTestId}>
        {givenName} {familyName}
      </span>
    );
  });

LayoutHeaderToolsAccountComponent.displayName = 'LayoutHeaderToolsAccountComponent';
