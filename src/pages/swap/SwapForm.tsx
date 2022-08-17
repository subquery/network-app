// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Stat } from '../../components';
import styles from './SwapForm.module.css';

export const SwapForm: React.VFC = () => {
  return (
    <div>
      <Stat title={'text'} value={'2500KSQT'} tooltip={'test'} />
      <Stat title={'text'} value={'2500KSQT'} />
    </div>
  );
};
