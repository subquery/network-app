// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import clsx from 'clsx';
import { Typography } from '@subql/react-ui';
import { Space } from 'antd';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import styles from './AppPageHeader.module.css';
import { CurEra } from '../CurEra';
import { COLORS } from '@utils';

type Props = {
  title: string | React.ReactNode;
  desc?: string | Array<string>;
};

export const AppPageHeader: React.VFC<Props> = ({ title, desc }) => {
  const sortedDescriptions = Array.isArray(desc) ? desc : [desc];
  return (
    <>
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

      {desc && (
        <div className={styles.desc}>
          <div className={styles.icon}>
            <AiOutlineInfoCircle color={COLORS.primary} />
          </div>
          <div>
            {sortedDescriptions.map((description) => (
              <Typography variant="medium" key={description}>
                {description}
              </Typography>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
