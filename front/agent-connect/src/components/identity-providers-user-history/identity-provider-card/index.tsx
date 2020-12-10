import './index.scss';

import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { removeIdentityProvider } from '../../../redux/actions';
import { selectIdentityProviderByUID } from '../../../redux/selectors';
import { RootState } from '../../../types';
import IdentityProviderCardContent from './identity-provider-card-content';

type IdentityProviderCardProps = {
  uid: string;
};

const IdentityProviderCardComponent = React.memo(
  ({ uid }: IdentityProviderCardProps): JSX.Element => {
    const dispatch = useDispatch();

    const identityProvider = useSelector((state: RootState) =>
      selectIdentityProviderByUID(state, uid),
    );

    const onClickRemoveButton = useCallback(() => {
      const action = removeIdentityProvider(uid);
      dispatch(action);
    }, [dispatch, uid]);

    return (
      <div className="flex-column text-center mx-2 mx-lg-3 mb-3 identiy-provider-card">
        {identityProvider && (
          <React.Fragment>
            <IdentityProviderCardContent identityProvider={identityProvider} />
            <button
              className="btn btn-link font-12 text-charcoal"
              type="button"
              onClick={onClickRemoveButton}>
              Retirer de cette liste
            </button>
          </React.Fragment>
        )}
      </div>
    );
  },
);

IdentityProviderCardComponent.displayName = 'IdentityProviderCardComponent';

export default IdentityProviderCardComponent;
