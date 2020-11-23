/* istanbul ignore file */
// skipped tests, unable to spy button click
import './index.scss';

import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { removeIdentityProvider } from '../../../redux/actions';
import { selectIdentityProviderByUID } from '../../../redux/selectors';
import { RootState } from '../../../types';

type IdentityProviderCardProps = {
  uid: string;
};

function IdentityProviderCardComponent({
  uid,
}: IdentityProviderCardProps): JSX.Element {
  const dispatch = useDispatch();
  const identityProvider = useSelector((state: RootState) =>
    selectIdentityProviderByUID(state, uid),
  );

  const onClickRemoveButton = useCallback(() => {
    const action = removeIdentityProvider(uid);
    dispatch(action);
  }, [dispatch, uid]);

  return (
    <div className="flex-column text-center mb-3 identiy-provider-card">
      <div className="border border-primary shadow-primary rounded py-4 mb-2">
        <div className="mb-2">Mon compte</div>
        <button
          className="btn btn-link title text-uppercase text-primary font-32"
          type="button">
          {identityProvider?.name || ''}
        </button>
      </div>
      <button
        className="btn btn-link font-12 text-charcoal"
        type="button"
        onClick={onClickRemoveButton}>
        Retirer de cette liste
      </button>
    </div>
  );
}

export default IdentityProviderCardComponent;
