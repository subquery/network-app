// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { AppTypography, Stat } from '../../components';
import styles from './SwapForm.module.css';

interface Stats {
  title: string;
  value: string;
  tooltip?: string;
}

interface SwapPair {
  from: string;
  fromMax: number;
  to: string;
  toMax: number;
}

interface ISwapForm {
  stats: Array<Stats>;
  pair: SwapPair;
}

export const SwapForm: React.FC<ISwapForm> = ({ stats, pair }) => {
  const { t } = useTranslation();
  return (
    <div className={styles.container}>
      <div className={styles.statsContainer}>
        {stats.map((statsItem) => (
          <div className={styles.stats} key={statsItem.title}>
            <Stat title={statsItem.title} value={statsItem.value} tooltip={statsItem.tooltip} />
          </div>
        ))}
      </div>

      <AppTypography className={styles.dataUpdateText}>{t('swap.dataUpdateEvery5Min')}</AppTypography>
    </div>
  );
};
