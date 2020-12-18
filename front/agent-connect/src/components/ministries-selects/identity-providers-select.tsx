import './identity-providers-select.scss';

import { Select } from 'antd';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { ReactComponent as CustomIconSVG } from '../../assets/select-input-custom-icon.svg';
import { RootState } from '../../types';
import { getIdentityProvidersByMinistryID } from './get-identity-providers-by-ministry-id';

type IdentityProvidersSelectProps = {
  ministryID: string;
  onSelect: Function;
};

const IdentityProvidersSelectComponent = React.memo(
  ({ ministryID, onSelect }: IdentityProvidersSelectProps): JSX.Element => {
    const [value, setValue] = useState<any>([]);

    const identityProviders = useSelector((state: RootState) =>
      getIdentityProvidersByMinistryID(state, ministryID),
    );

    // reset selected value on ministry changes
    useEffect(() => setValue([]), [ministryID]);

    const isSelectDisabled = identityProviders.length === 0;

    return (
      <Select
        aria-label="Sélectionner un fournisseur d'identité"
        className="mb-3 text-left"
        disabled={isSelectDisabled}
        dropdownClassName="fca-identity-providers-select"
        id="idp-selects"
        placeholder="Sélectionner un fournisseur d'identité"
        size="large"
        style={{ width: '100%' }}
        suffixIcon={<CustomIconSVG />}
        value={value}
        onChange={uid => {
          setValue(uid);
          onSelect(uid);
        }}>
        {identityProviders.map(identityProvider => {
          const { active, name, uid } = identityProvider;
          return (
            <Select.Option
              key={uid}
              disabled={!active}
              id={`idp-${uid}`}
              value={uid}>
              {name}
            </Select.Option>
          );
        })}
      </Select>
    );
  },
);

IdentityProvidersSelectComponent.displayName =
  'IdentityProvidersSelectComponent';

export default IdentityProvidersSelectComponent;
