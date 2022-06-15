// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Progress } from 'antd';
import moment from 'moment';
import styles from './SeasonProgress.module.css';

function getPeriod(mTo: moment.Moment, mNow: moment.Moment): string {
  if (mNow.isAfter(mTo)) {
    return '0d 0h 0m 0s';
  }

  const duration = moment.duration(mTo.diff(mNow));
  const days = Math.floor(duration.asDays());
  duration.subtract(moment.duration(days, 'days'));

  const hours = duration.hours();
  duration.subtract(moment.duration(hours, 'hours'));

  const minutes = duration.minutes();
  duration.subtract(moment.duration(minutes, 'minutes'));

  const seconds = duration.seconds();

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

function getStatus(mTo: moment.Moment, mNow: moment.Moment): string {
  if (mNow.isAfter(mTo)) {
    return 'This Season has ended';
  } else {
    return 'Current Season ends in';
  }
}

export const SeasonProgress: React.VFC<{
  timePeriod: {
    from: Date;
    to: Date;
  };
}> = (timePeriod) => {
  const now = new Date();
  const { from, to } = timePeriod.timePeriod;
  const mTo = moment(to);
  const mNow = moment(now);

  const status = getStatus(mTo, mNow);
  const timeLeft = getPeriod(mTo, mNow);
  const percent_complete = parseInt(
    ((Math.abs(now.getTime() - from.getTime()) / (to.getTime() - from.getTime())) * 100).toFixed(0),
  );

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
