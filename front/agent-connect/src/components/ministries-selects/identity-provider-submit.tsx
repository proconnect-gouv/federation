import { Button } from 'antd';
import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { choosenIdentityProvider } from '../../redux/actions';
import {
  selectIdentityProviderByUID,
  selectIdentityProviderInputs,
} from '../../redux/selectors';
import { RootState } from '../../types';

type IdentityProviderSubmitProps = {
  uid: string;
};

const IdentityProviderSubmitComponent = React.memo(
  ({ uid }: IdentityProviderSubmitProps): JSX.Element => {
    const dispatch = useDispatch();

    const formTargetURL = useSelector((state: RootState) => state.redirectURL);
    const hiddenInputs = useSelector((state: RootState) =>
      selectIdentityProviderInputs(state, uid),
    );
    const identityProvider = useSelector((state: RootState) =>
      selectIdentityProviderByUID(state, uid),
    );

    const buttonClickHandler = useCallback(() => {
      const action = choosenIdentityProvider(uid);
      dispatch(action);
    }, [dispatch, uid]);

    const isDisabled = !identityProvider || !identityProvider.active;

    return (
      <form
        action={formTargetURL}
        id={`fs-request-${uid}`}
        method="POST"
        name="fs-request">
        {hiddenInputs.map(([key, value]) => (
          <input key={key} defaultValue={value} name={key} type="hidden" />
        ))}
        <Button
          className="font-18 mx-auto"
          disabled={isDisabled}
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
