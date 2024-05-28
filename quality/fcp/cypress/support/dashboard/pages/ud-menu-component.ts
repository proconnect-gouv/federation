import { ChainableElement } from '../../common/types';

export default class UdMenuComponent {
  getUserLabel(): ChainableElement {
    return cy.get(
      'span[data-testid="layout-header-tools-account-component-desktop"]',
    );
  }

  getLogoutLink(): ChainableElement {
    return cy.get('a[data-testid="layout-header-tools-logout-button-desktop"]');
  }

  getHistoryLink(): ChainableElement {
    return cy.contains(
      'header[role="banner"] nav[role="navigation"] a',
      'Mon historique de connexion',
    );
  }

  getPreferencesLink(): ChainableElement {
    return cy.contains(
      'header[role="banner"] nav[role="navigation"] a',
      'Gérer mes accès',
    );
  }

  getOpenMobileMenuButton(): ChainableElement {
    return cy.get('#burger-button-mobile-menu');
  }

  getPreferencesMobileLink(): ChainableElement {
    return cy.contains(
      '#layout-header-menu-modal nav[role="navigation"] a',
      'Gérer mes accès',
    );
  }
}
