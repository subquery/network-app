// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Spinner as SubqlSpinner } from '@subql/components';

import styles from './Spinner.module.css';

type Props = {
  size?: number;
};

const Spinner: React.FC<Props> = ({ size }) => {
  return (
    <div className={styles.spinner}>
      <SubqlSpinner></SubqlSpinner>
    </div>
  );
};

export default Spinner;
