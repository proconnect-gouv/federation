import React from 'react';

type PanelTitleProps = {
  name: string;
};

function MinistryPanelTitleComponent({ name }: PanelTitleProps): JSX.Element {
  return <p className="font-18 m-0 font-weight-bold">{name}</p>;
}

export default MinistryPanelTitleComponent;
