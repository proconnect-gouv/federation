/* istanbul ignore file */
// untested dette
import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import React from 'react';

const antIcon = <LoadingOutlined spin style={{ fontSize: 48 }} />;

const LoaderComponent = (): JSX.Element => (
  <div className="text-center">
    <Spin indicator={antIcon} />
  </div>
);

export default LoaderComponent;
