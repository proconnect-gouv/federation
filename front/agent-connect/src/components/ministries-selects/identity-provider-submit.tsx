import { Button } from 'antd';
import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { choosenIdentityProvider } from '../../redux/actions';
import { selectIdentityProviderInputs } from '../../redux/selectors';
import { IdentityProvider, RootState } from '../../types';

type IdentityProviderSubmitProps = {
  identityProvider: IdentityProvider;
};

const IdentityProviderSubmitComponent = React.memo(
  ({ identityProvider }: IdentityProviderSubmitProps): JSX.Element => {
    const { active, uid } = identityProvider;
    const dispatch = useDispatch();
    const formTargetURL = useSelector((state: RootState) => state.redirectURL);

    const redirectToIdentityProviderInputs = useSelector((state: RootState) => {
      return selectIdentityProviderInputs(state, uid);
    });

    const buttonClickHandler = useCallback(() => {
      const action = choosenIdentityProvider(uid);
      dispatch(action);
    }, [dispatch, uid]);

    return (
      <form
        action={formTargetURL}
        id={`fs-request-${uid}`}
        method="POST"
        name="fs-request">
        {redirectToIdentityProviderInputs.map(([inputKey, inputValue]) => (
          <input
            key={inputKey}
            defaultValue={inputValue}
            name={inputKey}
            type="hidden"
          />
        ))}
        <Button
          className="font-18 mx-auto"
          disabled={!active}
          htmlType="submit"
          id="idp-go"
          size="large"
          type="primary"
          onClick={buttonClickHandler}>
          OK
        </Button>
      </form>
    );
  },
);

IdentityProviderSubmitComponent.displayName = 'IdentityProviderSubmitComponent';

export default IdentityProviderSubmitComponent;
