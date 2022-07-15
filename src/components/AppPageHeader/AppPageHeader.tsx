// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import clsx from 'clsx';
import { Typography } from '@subql/react-ui';
import styles from './AppPageHeader.module.css';
import { CurEra } from '../CurEra';

type Props = {
  title: string | React.ReactNode;
};

export const AppPageHeader: React.VFC<Props> = ({ title }) => {
  return (
    <div className={styles.header}>
      {title && typeof title === 'string' ? (
        <Typography variant="h5" className={clsx(styles.title, styles.text)}>
          {title}
        </Typography>
      ) : (
        <>{title}</>
      )}

      <CurEra />
    </div>
  );
};
