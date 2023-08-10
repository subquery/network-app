// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ProgressBar, Typography } from '@subql/components';
import { indexingProgress } from '@subql/network-clients';
import { strip } from '@utils';

import styles from './IndexerDetails.module.less';

const Progress: React.FC<{ startBlock?: number; currentBlock: number; targetBlock: number }> = ({
  startBlock = 0,
  currentBlock,
  targetBlock,
}) => {
  const { t } = useTranslation();

  // no necessary to calculate a very exact result.
  // just show who didn't sync 100% is ok.
  // 99.9978 and 99.9999 are same thing in this situation.
  const maxProgress = React.useMemo(
    () =>
      indexingProgress({
        currentHeight: currentBlock,
        startHeight: startBlock,
        targetHeight: targetBlock,
      }),
    [startBlock, currentBlock, targetBlock],
  );

  const blocksBehind = Math.max(targetBlock - currentBlock, 0);

  return (
    <div className={styles.progress}>
      <ProgressBar progress={maxProgress} className={styles.progressBar} showInfo={false} />
      {blocksBehind > 0 && (
        <div>
          <Typography variant="medium" className={styles.precentage}>
            {`${strip(maxProgress * 100)} % `}
          </Typography>
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
