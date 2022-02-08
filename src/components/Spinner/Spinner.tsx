// Copyright 2020-2022 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CircularProgress } from '@material-ui/core';
import * as React from 'react';
import styles from './Spinner.module.css';

type Props = {
  size?: number;
};

const Spinner: React.VFC<Props> = (props) => {
  return (
    <div className={styles.spinner}>
      <CircularProgress size={props.size} />
    </div>
  );
};

export default Spinner;
