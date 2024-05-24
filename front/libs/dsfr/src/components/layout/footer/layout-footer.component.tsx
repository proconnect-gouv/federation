import React, { useContext } from 'react';

import { AppContext } from '@fc/state-management';

import type { NavigationLink } from '../../../interfaces';
import { LogoRepubliqueFrancaiseComponent } from '../../logos';
import { LayoutHomepageLinkComponent } from '../homepage-link';
import { LayoutFooterBottomLinksComponent } from './layout-footer-bottom-links.component';
import { LayoutFooterContentLinksComponent } from './layout-footer-content-links.component';
import { LayoutFooterLicenceComponent } from './layout-footer-licence.component';

interface LayoutFooterComponentProps {
  showLicence?: boolean;
  topLinks?: NavigationLink[];
}

const DEFAULT_TOP_LINKS = [
  {
    a11y: 'Accèder au site legifrance.gouv.fr nouvelle fenêtre',
    href: 'https://www.legifrance.gouv.fr',
    label: 'legifrance.gouv.fr',
  },
  {
    a11y: 'Accèder au site info.gouv.fr nouvelle fenêtre',
    href: 'https://www.info.gouv.fr',
    label: 'info.gouv.fr',
  },
  {
    a11y: 'Accèder au site service-public.fr nouvelle fenêtre',
    href: 'https://www.service-public.fr/',
    label: 'service-public.fr',
  },
  {
    a11y: 'Accèder au site data.gouv.fr nouvelle fenêtre',
    href: 'https://data.gouv.fr',
    label: 'data.gouv.fr',
  },
];

export const LayoutFooterComponent = React.memo(
  ({ showLicence = false, topLinks = DEFAULT_TOP_LINKS }: LayoutFooterComponentProps) => {
    const appContext = useContext(AppContext);
    const layoutConfig = appContext.state.config.Layout;
    const {
      bottomLinks,
      footerDescription: description,
      footerLinkTitle,
      logo: ApplicationLogo,
    } = layoutConfig;

    const showFooterBottom = bottomLinks || showLicence;

    return (
      <footer className="sticky-footer fr-footer" id="footer" role="contentinfo">
        <div className="fr-container">
          <div className="fr-footer__body">
            <div className="fr-footer__brand fr-enlarge-link">
              <LogoRepubliqueFrancaiseComponent />
              {ApplicationLogo && (
                <LayoutHomepageLinkComponent isFooter>
                  <img
                    alt={footerLinkTitle}
                    className="fr-footer__logo fr-responsive-img"
                    src={ApplicationLogo}
                    style={{ height: 90, maxHeight: 90 }}
                  />
                </LayoutHomepageLinkComponent>
              )}
            </div>
            <div className="fr-footer__content">
              {description && <p className="fr-footer__content-desc">{description}</p>}
              {topLinks && <LayoutFooterContentLinksComponent items={topLinks} />}
            </div>
          </div>
          {showFooterBottom && (
            <div className="fr-footer__bottom" data-testid="sticky-footer-fr-footer__bottom">
              {bottomLinks && <LayoutFooterBottomLinksComponent items={bottomLinks} />}
              {showLicence && <LayoutFooterLicenceComponent />}
            </div>
          )}
        </div>
      </footer>
    );
  },
);

LayoutFooterComponent.displayName = 'LayoutFooterComponent';
