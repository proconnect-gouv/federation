import React from 'react';
import { Link } from 'react-router-dom';

import {
  LogoAgentConnect,
  LogoFranceConnect,
  LogoFranceConnectPlus,
  LogoMarianne,
} from '../assets/logos';

type LayoutHeaderProps = {
  // @TODO move to fc/front/libs
  type: 'agentconnect' | 'franceconnect' | 'franceconnectplus';
};

const LayoutHeaderComponent = React.memo(
  // @TODO move to fc/front/libs
  ({ type }: LayoutHeaderProps): JSX.Element => (
    <header className="shadow-bottom mb40" role="banner">
      <div className="content-wrapper-lg px16 py24">
        <Link
          className="flex-columns flex-start items-center"
          title="AgentConnect - Retour à l'accueil"
          to="/">
          <LogoMarianne className="mr40" />
          {type === 'agentconnect' && <LogoAgentConnect />}
          {type === 'franceconnect' && <LogoFranceConnect />}
          {type === 'franceconnectplus' && <LogoFranceConnectPlus />}
        </Link>
      </div>
    </header>
  ),
);

LayoutHeaderComponent.displayName = 'LayoutHeaderComponent';

export default LayoutHeaderComponent;
