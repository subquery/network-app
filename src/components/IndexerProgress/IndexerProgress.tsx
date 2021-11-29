// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import styles from './IndexerProgress.module.css';

type Status = {
  indexer: string;
  latestBlock: number;
};

type Props = {
  indexerStatus: Status[];
  chainBlockHeight: number;
  startBlock: number;
  containerClassName?: string;
};

const IndexerProgress: React.VFC<Props> = ({ indexerStatus, chainBlockHeight, startBlock, containerClassName }) => {
  const maxProgress = React.useMemo(() => {
    const greatestBlock = Math.max(0, ...indexerStatus.map((status) => status.latestBlock));

    return Math.min(Math.max(0, greatestBlock - startBlock) / (chainBlockHeight - startBlock), 1);
  }, [startBlock, indexerStatus, chainBlockHeight]);

  const status = React.useMemo(() => {
    if (!indexerStatus.length) {
      return 'Not indexed';
    }

    if (maxProgress < 0.98) {
      return 'Indexing';
    }

    return 'Indexed';
  }, [indexerStatus, maxProgress]);

  return (
    <div className={[styles.container, containerClassName].join(' ')}>
      <span className={styles.status}>{status}</span>
      <div className={styles.progressContainer}>
        <div className={[styles.progress, styles.progressBack].join(' ')}>
          <div
            className={[styles.progress, styles.progressFront].join(' ')}
            style={{ width: `${maxProgress * 100}%` }}
          />
        </div>
        <span className={styles.percent}>{`${(maxProgress * 100).toFixed(2)}%`}</span>
      </div>
    </div>
  );
};

export default IndexerProgress;
