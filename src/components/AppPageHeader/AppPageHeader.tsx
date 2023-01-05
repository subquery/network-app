// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import clsx from 'clsx';
import { Typography } from '@subql/react-ui';
import { Space } from 'antd';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import styles from './AppPageHeader.module.css';
import { CurEra } from '../CurEra';
import { COLORS } from '../../utils';
import { useTranslation } from 'react-i18next';

type Props = {
  title: string | React.ReactNode;
  desc?: string;
};

export const AppPageHeader: React.VFC<Props> = ({ title, desc }) => {
  const { t } = useTranslation();
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
        <Space>
          <AiOutlineInfoCircle className="flex" color={COLORS.primary} /> {desc}
        </Space>
      )}
    </>
  );
};
