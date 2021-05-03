import './styles.scss';

import { Button, Form, Input } from 'antd';
import React, { useCallback } from 'react';
import { IoMdSearch } from 'react-icons/io';

type SearchInputProps = {
  name: string;
  label: string;
  placeholder: string;
  onChange: Function;
};

const SearchInputComponent = React.memo(
  ({ label, name, onChange, placeholder }: SearchInputProps): JSX.Element => {
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
        <span className="d-block text-left mb-2">Veuillez taper le nom complet de votre administration</span>
        <Input.Search
            className="text-left rounded-2"
            data-testid={name}
            enterButton={
              <Button
                data-testid={`${name}-submit-button`}
                htmlType="submit"
                type="primary">
                <IoMdSearch
                  className="text-white align-middle mr-2 mb-1"
                  role="img"
                />
                <b>Rechercher</b>
              </Button>
            }
            id={name}
            name={name}
            placeholder={placeholder}
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
