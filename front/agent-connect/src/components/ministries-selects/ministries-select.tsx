import './ministries-select.scss';

import { Select } from 'antd';
import React from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../../types';

type MinistriesSelectComponoentProps = {
  onSelect: Function;
};

const { Option } = Select;

const MinistriesSelectComponoent = React.memo(
  ({ onSelect }: MinistriesSelectComponoentProps): JSX.Element => {
    const ministries = useSelector((state: RootState) => state.ministries);

    return (
      <Select
        className="mb-3 text-left"
        defaultActiveFirstOption={false}
        dropdownClassName="fca-ministries-select"
        id="select-ministry"
        placeholder="Sélectionner un ministère"
        size="large"
        style={{ width: '100%' }}
        onSelect={ministryId => {
          onSelect(ministryId);
        }}>
        {ministries.map(ministry => (
          <Option
            key={ministry.id}
            id={`ministry-${ministry.id}`}
            value={ministry.id}>
            {ministry.name}
          </Option>
        ))}
      </Select>
    );
  },
);

MinistriesSelectComponoent.displayName = 'MinistriesSelectComponoent';

export default MinistriesSelectComponoent;
