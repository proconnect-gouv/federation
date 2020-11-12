/* istanbul ignore file */
import { Collapse } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';

import CardTitleComponent from './card-title';

type CardComponentProps = {
  index: number;
};

function CardComponent({ index, ...props }: CardComponentProps): JSX.Element {
  return (
    <Collapse.Panel
      key={index}
      showArrow
      {...props}
      className="mb-4 p-2 border border-primary rounded"
      header={<CardTitleComponent />}>
      <ul className="font-18 px-3">
        <li className="mb-2">
          <Link to="/">
            <span>Fournisseur d&apos;identité 1</span>
          </Link>
        </li>
        <li className="mb-2">
          <Link to="/">
            <span>Fournisseur d&apos;identité 2</span>
          </Link>
        </li>
        <li className="mb-2">
          <Link to="/">
            <span>Fournisseur d&apos;identité 3</span>
          </Link>
        </li>
        <li className="mb-2">
          <Link to="/">
            <span>Fournisseur d&apos;identité 4</span>
          </Link>
        </li>
      </ul>
    </Collapse.Panel>
  );
}

export default CardComponent;
