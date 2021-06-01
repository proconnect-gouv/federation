import { Form } from 'antd';
import React, { useCallback } from 'react';

import SearchInput from '../search-input';

type SearchFormComponentProps = {
  label: string;
  onChange: Function;
};

const SearchFormComponent = React.memo(
  ({ label, onChange }: SearchFormComponentProps): JSX.Element => {
    const onInputChangeHandler = useCallback(
      inputValue => onChange(inputValue),
      [onChange],
    );

    const onSubmitSearchForm = useCallback(
      (values: any) => {
        const inputValue = values['fi-search-term'];
        onInputChangeHandler(inputValue);
      },
      [onInputChangeHandler],
    );

    return (
      <Form
        className="w-100"
        id="fi-search-form"
        layout="vertical"
        size="large"
        onFinish={onSubmitSearchForm}>
        <SearchInput
          label={label}
          name="fi-search-term"
          placeholder="ex: ministere de la mer, ministere de..."
          onChange={onInputChangeHandler}
        />
      </Form>
    );
  },
);

SearchFormComponent.displayName = 'SearchFormComponent';

export default SearchFormComponent;
