// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Progress } from 'antd';
import dayjs from 'dayjs';

import { getProgress, getTimeLeft } from '../../utils';
import styles from './SeasonProgress.module.css';

function getStatus(mTo: dayjs.Dayjs, mNow: dayjs.Dayjs): string {
  if (mNow.isAfter(mTo)) {
    return 'This Season has ended';
  } else {
    return 'Current Season ends in';
  }
}

export const SeasonProgress: React.FC<{
  timePeriod: {
    from: Date;
    to: Date;
  };
}> = (timePeriod) => {
  const now = new Date();
  const { from, to } = timePeriod.timePeriod;
  const mTo = dayjs(to);
  const mNow = dayjs(now);

  const status = getStatus(mTo, mNow);
  const timeLeft = getTimeLeft(mTo, mNow);
  const percent_complete = getProgress(now, from, to);

  return (
    <div className={styles.seasonProgress}>
      <div className={styles.description}>
        <h3>{status}</h3>
        <h1>
          <b>{timeLeft}</b>
        </h1>
      </div>
      <div className={styles.progress}>
        <Progress
          strokeColor={{
            '0%': '#4289DE',
            '100%': '#EA4D8A',
          }}
          percent={percent_complete}
          status="active"
        />
      </div>
    </div>
  );
};
