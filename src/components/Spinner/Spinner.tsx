// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import * as React from 'react';
import styles from './Spinner.module.css';

type Props = {
  size?: number;
};

const Spinner: React.FC<Props> = ({ size }) => {
  const antIcon = <LoadingOutlined style={{ fontSize: size }} spin />;

  return (
    <div className={styles.spinner}>
      <Spin indicator={antIcon} />
    </div>
  );
};

export default Spinner;
