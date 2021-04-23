/* istanbul ignore file */

import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import React from 'react';

const antIcon = <LoadingOutlined spin style={{ fontSize: 48 }} />;

function SpinLoaderComponent(): JSX.Element {
  return (
    <div className="text-center">
      <Spin indicator={antIcon} />
    </div>
  );
}

SpinLoaderComponent.displayName = 'SpinLoaderComponent';

export default SpinLoaderComponent;
