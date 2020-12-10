import './search-input.scss';

import { Button, Form, Input } from 'antd';
import React, { useCallback } from 'react';
import { IoMdSearch } from 'react-icons/io';

type SearchInputProps = {
  name: string;
  label: string;
  onChange: Function;
};

const SearchInputComponent = React.memo(
  ({ label, name, onChange }: SearchInputProps): JSX.Element => {
    const inputSearchHandler = useCallback(
      evt => {
        const { value } = evt.target as HTMLInputElement;
        onChange(value);
      },
      [onChange],
    );

    return (
      <Form.Item
        className="offset-md-1 col-md-10 col-12"
        colon={false}
        htmlFor={name}
        label={<span className="h4 font-weight-bold">{label}</span>}
        name={name}>
        <Input.Search
          className="text-left rounded-2"
          data-testid="mock-search-input"
          enterButton={
            <Button htmlType="submit" type="primary">
              <IoMdSearch
                className="text-white align-middle mr-2 fs-24 mb-1"
                role="img"
              />
              <b>Rechercher</b>
            </Button>
          }
          id={name}
          placeholder="ex: ameli, impot.gouv..."
          size="large"
          title={label}
          onChange={inputSearchHandler}
        />
      </Form.Item>
    );
  },
);

SearchInputComponent.displayName = 'SearchInputComponent';

export default SearchInputComponent;
