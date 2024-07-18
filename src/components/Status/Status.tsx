// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { WarningOutlined } from '@ant-design/icons';
import { DeploymentStatus } from '@hooks';

import styles from './Status.module.css';

export enum StatusColor {
  red = 'red',
  green = 'green',
  gray = 'gray',
  blue = 'blue',
}

export const deploymentStatus: { [key: string]: StatusColor } = {
  INDEXING: StatusColor.blue,
  STARTED: StatusColor.blue,
  READY: StatusColor.green,
  NOTINDEXING: StatusColor.gray,
  TERMINATED: StatusColor.red,
  [DeploymentStatus.Unhealthy]: StatusColor.red,
};

type Props = {
  text: string;
  color?: StatusColor;
};

const Status: React.FC<Props> = ({ text, color = 'gray' }) => {
  return (
    <div className={[styles.container, styles[`container-${color}`]].join(' ')}>
      {text === DeploymentStatus.Unhealthy ? <WarningOutlined style={{ color: color }} /> : null}
      <p className={[styles.text, styles[`text-${color}`]].join(' ')}>{text}</p>
    </div>
  );
};

export default Status;
