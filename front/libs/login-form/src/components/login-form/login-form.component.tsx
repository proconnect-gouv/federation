import React from 'react';

import type { AccountConfig } from '@fc/account';
import { Options as AccountOptions } from '@fc/account';
import { ConfigService } from '@fc/config';
import type { ConnectTypes } from '@fc/dsfr';
import { ButtonTypes, LoginConnectButton } from '@fc/dsfr';

interface LoginFormComponentProps {
  connectType: ConnectTypes;
  className?: string;
  origin?: string;
}

export const LoginFormComponent = React.memo(
  ({ className, connectType, origin }: LoginFormComponentProps) => {
    const config = ConfigService.get<AccountConfig>(AccountOptions.CONFIG_NAME);
    const { login } = config.endpoints;

    return (
      <form action={login} data-testid="login-form-component" method="get">
        {origin && <input name="origin" type="hidden" value={origin} />}
        <LoginConnectButton
          className={className}
          connectType={connectType}
          data-testid="login-connect-button"
          type={ButtonTypes.SUBMIT}
        />
      </form>
    );
  },
);

LoginFormComponent.displayName = 'LoginFormComponent';
