/* istanbul ignore file */
// unable to spy choosenIdentityProvider
import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { choosenIdentityProvider } from '../../../redux/actions';
import { IdentityProvider, RootState } from '../../../types';

type PanelButtonProps = {
  identityProvider: IdentityProvider;
};

const PanelButtonComponent = React.memo(
  ({ identityProvider }: PanelButtonProps): JSX.Element => {
    const { active, name, uid } = identityProvider;
    const dispatch = useDispatch();

    const formTargetURL = useSelector((state: RootState) => state.redirectURL);

    const redirectToIdentityProviderInputs = useSelector((state: RootState) =>
      Object.entries({
        ...state.redirectToIdentityProviderInputs,
        providerUid: uid,
      }),
    );

    const buttonClickHandler = useCallback(() => {
      const action = choosenIdentityProvider(uid);
      dispatch(action);
    }, [dispatch, uid]);

    return (
      <form action={formTargetURL} id={`fs-request-${uid}`} method="POST" name="fs-request">
        {redirectToIdentityProviderInputs.map(([inputKey, inputValue]) => (
          <input
            key={inputKey}
            defaultValue={inputValue}
            name={inputKey}
            type="hidden"
          />
        ))}
        <button
          className="btn btn-link font-18"
          disabled={!active}
          id={`idp-${uid}`}
          type="submit"
          onClick={buttonClickHandler}>
          {name}
        </button>
      </form>
    );
  },
);

export default PanelButtonComponent;
