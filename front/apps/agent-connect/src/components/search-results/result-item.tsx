import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { choosenIdentityProvider } from '../../redux/actions';
import { selectIdentityProviderInputs } from '../../redux/selectors';
import { IdentityProvider, RootState } from '../../types';
import './result-item.scss';

type SearchResultsProps = {
  identityProvider: IdentityProvider;
};

const ResultItemComponent = React.memo(
  ({ identityProvider }: SearchResultsProps): JSX.Element => {
    const { name, uid } = identityProvider;
    const formTargetURL = useSelector((state: RootState) => state.redirectURL);

    const redirectToIdentityProviderInputs = useSelector((state: RootState) =>
      selectIdentityProviderInputs(state, uid),
    );

    const dispatch = useDispatch();
    const buttonClickHandler = useCallback(() => {
      const action = choosenIdentityProvider(uid);
      dispatch(action);
    }, [uid, dispatch]);

    return (
      <form
        action={formTargetURL}
        aria-label="form"
        id={`fca-search-idp-${uid}`}
        method="POST"
      >
        {redirectToIdentityProviderInputs.map(([inputKey, inputValue]) => (
          <input
            key={inputKey}
            defaultValue={inputValue}
            name={inputKey}
            type="hidden"
          />
        ))}
        <button
          className="button-style"
          id={`idp-${uid}-button`}
          type="submit"
          onClick={buttonClickHandler}
        >
          {name}
        </button>
      </form>
    );
  },
);

ResultItemComponent.displayName = 'ResultItemComponent';

export default ResultItemComponent;
