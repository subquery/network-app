// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { Typography } from '@subql/components';
import { COLORS } from '@utils';
import { Space } from 'antd';
import clsx from 'clsx';

import { CurEra } from '../CurEra';
import styles from './AppPageHeader.module.css';

type Props = {
  title: string | React.ReactNode;
  desc?: string | Array<string>;
};

export const AppPageHeader: React.FC<Props> = ({ title, desc }) => {
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
