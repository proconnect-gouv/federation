import './identity-providers-select.scss';

import { Select } from 'antd';
import React, { useEffect, useState } from 'react';

import { IdentityProvider } from '../../types';

const { Option } = Select;

type IdentityProvidersSelectProps = {
  identityProviders: IdentityProvider[];
  onSelect: any;
};

const IdentityProvidersSelectComponent = React.memo(
  ({
    identityProviders,
    onSelect,
  }: IdentityProvidersSelectProps): JSX.Element => {
    const [selected, setSelected] = useState<any>(null);
    const [options, setOptions] = useState<IdentityProvider[]>([]);

    const onSelectHandler = (identityProviderUID: string) => {
      setSelected(identityProviderUID);
      onSelect(identityProviderUID);
    };

    useEffect(() => {
      setSelected(null);
      setOptions(identityProviders);
    }, [identityProviders]);

    return (
      <Select
        className="mb-3 text-left"
        defaultActiveFirstOption={false}
        disabled={identityProviders.length === 0}
        dropdownClassName="fca-identity-providers-select"
        id="idp-selects"
        placeholder="Sélectionner un fournisseur d'identité"
        size="large"
        style={{ width: '100%' }}
        value={selected}
        onChange={onSelectHandler}>
        {options.map(identityProvider => (
          <Option
            key={identityProvider.uid}
            disabled={!identityProvider.active}
            id={`idp-${identityProvider.uid}`}
            value={identityProvider.uid}>
            {identityProvider.name}
          </Option>
        ))}
      </Select>
    );
  },
);

IdentityProvidersSelectComponent.displayName =
  'IdentityProvidersSelectComponent';

export default IdentityProvidersSelectComponent;
