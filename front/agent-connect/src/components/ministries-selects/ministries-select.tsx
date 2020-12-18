import './ministries-select.scss';

import { Select } from 'antd';
import React from 'react';
import { useSelector } from 'react-redux';

import { ReactComponent as CustomIconSVG } from '../../assets/select-input-custom-icon.svg';
import { RootState } from '../../types';

type MinistriesSelectComponoentProps = {
  onSelect: Function;
};

const MinistriesSelectComponoent = React.memo(
  ({ onSelect }: MinistriesSelectComponoentProps): JSX.Element => {
    const ministries = useSelector((state: RootState) => state.ministries);
    return (
      <Select
        aria-label="Sélectionner un ministère"
        className="mb-3 text-left"
        dropdownClassName="fca-ministries-select"
        id="select-ministry"
        placeholder="Sélectionner un ministère"
        size="large"
        style={{ width: '100%' }}
        suffixIcon={<CustomIconSVG />}
        onSelect={ministryId => onSelect(ministryId)}>
        {ministries.map(ministry => {
          const { id, name } = ministry;
          return (
            <Select.Option key={id} id={`ministry-${id}`} value={id}>
              {name}
            </Select.Option>
          );
        })}
      </Select>
    );
  },
);

MinistriesSelectComponoent.displayName = 'MinistriesSelectComponoent';

export default MinistriesSelectComponoent;
