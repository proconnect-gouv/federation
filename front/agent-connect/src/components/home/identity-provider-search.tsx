/* istanbul ignore file */
import './identity-provider-search.scss';

import { AutoComplete, Button, Form, Input } from 'antd';
import { OptionData, OptionGroupData } from 'rc-select/lib/interface';
import React, { useCallback } from 'react';
import { IoMdSearch } from 'react-icons/io';

type SearchComponentProps = {
  options?: OptionData[];
};

export const nonCaseSensitiveSearch = (
  inputValue: string,
  option?: OptionData | OptionGroupData
): boolean => {
  const value = `${option?.value || ''}`;
  const valueUppercase = value.toUpperCase();
  const inputValueUppercase = inputValue.toUpperCase();
  return valueUppercase.includes(inputValueUppercase);
};

const defaultProps = {
  options: [
    { label: 'Light', value: 'light' },
    { label: 'Bamboo', value: 'bamboo' },
  ],
};

function IdentityProviderSearchComponent({
  options,
}: SearchComponentProps): JSX.Element {
  const onFormSubmit = useCallback(() => {
    // not implemented
  }, []);

  const nonSensitiveFilter = useCallback(nonCaseSensitiveSearch, []);

  return (
    <div className="row text-center mb-8" id="identity-provider-search">
      <Form
        className="w-100"
        layout="vertical"
        size="large"
        onFinish={onFormSubmit}>
        <Form.Item
          className="col-12"
          colon={false}
          label={
            <span className="h4 font-weight-bold">
              Je connais le nom de mon fournisseur d&apos;identité
            </span>
          }>
          <Input.Group compact>
            <AutoComplete
              className="text-left"
              dropdownClassName="fc-autocomplete-dropdown"
              filterOption={nonSensitiveFilter}
              options={options}>
              <Input
                placeholder="ex: ameli, impot.gouv..."
                title="Nom du fournisseur"
              />
            </AutoComplete>
            <Button htmlType="submit" type="primary">
              <IoMdSearch
                className="text-white align-middle mr-2 fs-24 mb-1"
                role="img"
              />
              <b>Rechercher</b>
            </Button>
          </Input.Group>
        </Form.Item>
      </Form>
    </div>
  );
}

IdentityProviderSearchComponent.defaultProps = defaultProps;

export default IdentityProviderSearchComponent;
