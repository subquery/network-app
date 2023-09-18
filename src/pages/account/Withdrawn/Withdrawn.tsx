// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';

import { Locked } from './Locked';
import styles from './Withdrawn.module.css';

export const Withdrawn: React.FC = () => {
  return (
    <div className={styles.rewardsContainer}>
      <Locked />
    </div>
  );
};

export default Withdrawn;
