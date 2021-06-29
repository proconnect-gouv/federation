/* istanbul ignore file */

/**
 * @TODO #493 untested
 * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/493
 */
import classnames from 'classnames';
import React from 'react';
import { useSelector } from 'react-redux';

import { selectIdentityProviderInputs } from '../../redux/selectors';
import { IdentityProvider, RootState } from '../../types';

type IdentityProviderCardProps = {
  identityProvider: IdentityProvider;
};

const IdentityProviderCardContentComponent = React.memo(
  ({ identityProvider }: IdentityProviderCardProps): JSX.Element => {
    const { active, name, uid } = identityProvider;

    const formTargetURL = useSelector((state: RootState) => state.redirectURL);
    const redirectToIdentityProviderInputs = useSelector((state: RootState) =>
      selectIdentityProviderInputs(state, uid),
    );

    return (
      <div
        className={classnames('rounded py-4 mb-2', {
          border: active,
          'border-primary': active,
          disabled: !active,
          'shadow-primary': active,
        })}>
        <div className="mb-2">Mon compte</div>
        <form action={formTargetURL} id={`fca-history-idp-${uid}`} method="POST">
          {redirectToIdentityProviderInputs.map(([inputKey, inputValue]) => (
            <input
              key={inputKey}
              defaultValue={inputValue}
              name={inputKey}
              type="hidden"
            />
          ))}
          <button
            className="btn btn-link title text-uppercase text-primary font-32"
            disabled={!active}
            type="submit">
            {name}
          </button>
        </form>
      </div>
    );
  },
);

IdentityProviderCardContentComponent.displayName =
  'IdentityProviderCardContentComponent';

export default IdentityProviderCardContentComponent;
