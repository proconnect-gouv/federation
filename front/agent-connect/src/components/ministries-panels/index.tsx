/* istanbul ignore file */
// untested dette
import './index.scss';

import { Collapse } from 'antd';
import React, { useCallback } from 'react';
import { AiOutlineMinus } from 'react-icons/ai';
import { GoPlus } from 'react-icons/go';
import { useSelector } from 'react-redux';

import { Ministry, RootState } from '../../types';
import MinistryPanel from './ministry-panel';

const IdentityProvidersPanelsComponent = React.memo(
  (): JSX.Element => {
    const ministries = useSelector((state: RootState) => state.ministries);

    const expandIconHandler = useCallback(({ isActive }) => {
      const IconComponent = isActive ? AiOutlineMinus : GoPlus;
      return <IconComponent className="text-primary" role="img" size="22px" />;
    }, []);

    return (
      <section className="row" id="ministries-panels">
        <p className="h4 col-12">
          Je recherche les fournisseurs d&apos;identité de mon administration
        </p>
        <div className="col-12">
          <Collapse
            ghost
            accordion={false}
            bordered={false}
            className="text-left"
            expandIcon={expandIconHandler}
            expandIconPosition="right">
            {ministries.map((ministry: Ministry) => {
              const { id } = ministry;
              return <MinistryPanel key={id} ministry={ministry} />;
            })}
          </Collapse>
        </div>
      </section>
    );
  },
);

IdentityProvidersPanelsComponent.displayName =
  'IdentityProvidersPanelsComponent';

export default IdentityProvidersPanelsComponent;
