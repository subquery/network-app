// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import styles from './IndexerDetails.module.css';
import progressStyles from '../IndexerProgress/IndexerProgress.module.css';

const Progress: React.FC<{ startBlock?: number; currentBlock: number; targetBlock: number }> = ({
  startBlock = 0,
  currentBlock,
  targetBlock,
}) => {
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
      <span className={styles.behind}>{`${targetBlock - currentBlock} blocks behind`}</span>
    </div>
  );
};

export default Progress;
