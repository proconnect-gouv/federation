/* istanbul ignore file */
// unable to spy choosenIdentityProvider
import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { choosenIdentityProvider } from '../../../redux/actions';
import { IdentityProvider, RootState } from '../../../types';

type PanelButtonProps = {
  identityProvider: IdentityProvider;
};

const FORM_HIDDEN_INPUTS = Object.entries({
  acr_values: 'eidas2',
  providerUid: 'corev2',
  redirect_uri: 'https://fsp1v2.docker.dev-franceconnect.fr/login-callback',
  response_type: 'code',
  scope:
    'openid gender birthdate birthcountry birthplace given_name family_name email preferred_username address phone',
});

const PanelButtonComponent = React.memo(
  ({ identityProvider }: PanelButtonProps): JSX.Element => {
    const { name, uid } = identityProvider;
    const formTargetURL = useSelector((state: RootState) => state.redirectURL);

    const dispatch = useDispatch();
    const buttonClickHandler = useCallback(() => {
      const action = choosenIdentityProvider(uid);
      dispatch(action);
    }, [dispatch, uid]);

    return (
      <form action={formTargetURL} method="POST">
        {FORM_HIDDEN_INPUTS.map(([inputKey, inputValue]) => (
          <input
            key={inputKey}
            name={inputKey}
            type="hidden"
            value={inputValue}
          />
        ))}
        <button
          className="btn btn-link font-18"
          type="submit"
          onClick={buttonClickHandler}>
          {name}
        </button>
      </form>
    );
  },
);

export default PanelButtonComponent;
