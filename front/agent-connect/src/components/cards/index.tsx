/* istanbul ignore file */
import { Collapse } from 'antd';
import React, { useCallback } from 'react';
import { AiOutlineMinus } from 'react-icons/ai';
import { GoPlus } from 'react-icons/go';

import Card from './card';

function CardsComponent(): JSX.Element {
  const expandIconHandler = useCallback(({ isActive }) => {
    const IconComponent = isActive ? AiOutlineMinus : GoPlus;
    return <IconComponent className="text-primary" role="img" size="22px" />;
  }, []);

  return (
    <Collapse
      ghost
      accordion={false}
      bordered={false}
      className="text-left"
      expandIcon={expandIconHandler}
      expandIconPosition="right">
      <Card key={1} index={1} />
      <Card key={2} index={2} />
      <Card key={3} index={3} />
      <Card key={4} index={4} />
    </Collapse>
  );
}

export default CardsComponent;
