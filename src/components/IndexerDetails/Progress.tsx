// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import styles from './IndexerDetails.module.css';
import { useTranslation } from 'react-i18next';
import { ProgressBar, Typography } from '@subql/components';
import { truncateToDecimalPlace } from '@utils';

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

  const blocksBehind = Math.max(targetBlock - currentBlock, 0);

  return (
    <div className={styles.progress}>
      <ProgressBar progress={truncateToDecimalPlace(maxProgress, 4)} className={styles.progressBar} />
      {blocksBehind > 0 && (
        <div>
          <Typography variant="medium" className={styles.indexingBlock}>
            {t('indexerProgress.blocks')}
          </Typography>
          <Typography variant="medium" className={styles.indexingBlockCount}>{`#${currentBlock}`}</Typography>
        </div>
      )}
    </div>
  );
};

export default Progress;
