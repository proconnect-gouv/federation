/* istanbul ignore file */

// declarative file
import { LayoutConfig } from '@fc/dsfr';

// @NOTE Use instead svg logo from libs/DSFR
import { LogoFranceConnectComponent } from '../ui/components/logo-france-connect';

export const Layout: LayoutConfig = {
  bottomLinks: [],
  footerDescription:
    'Partenaires Agent Connect est un dispositif qui permet aux administrateurs FC de gérer les partenaires Agent Connnect',
  footerLinkTitle: 'Partenaires AC',
  logo: LogoFranceConnectComponent,
};
