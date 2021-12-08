// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import styles from './IndexerDetails.module.css';
import progressStyles from '../IndexerProgress/IndexerProgress.module.css';
import { useTranslation } from 'react-i18next';
import { Typography } from '@subql/react-ui';

const Progress: React.FC<{ startBlock?: number; currentBlock: number; targetBlock: number }> = ({
  startBlock = 0,
  currentBlock,
  targetBlock,
}) => {
  const { t } = useTranslation();

  const maxProgress = React.useMemo(
    () => Math.min(Math.max((currentBlock - startBlock) / (targetBlock - startBlock), 0), 1),
    [startBlock, currentBlock, targetBlock],
  );

  return (
    <div className={styles.progress}>
      <div className={[progressStyles.progress, progressStyles.progressBack, styles.progressBar].join(' ')}>
        <div
          className={[progressStyles.progress, progressStyles.progressFront].join(' ')}
          style={{ width: `${maxProgress * 100}%` }}
        />
      </div>
      <span className={progressStyles.percent}>{`${(maxProgress * 100).toFixed(2)}%`}</span>
      <Typography variant="medium" className={styles.behind}>
        {t('indexerProgress.blocks', { count: targetBlock - currentBlock })}
      </Typography>
    </div>
  );
};

export default Progress;
