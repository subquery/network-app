// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useEra } from '@hooks';
import { Spinner, Typography } from '@subql/components';
import { Progress } from 'antd';
import i18next from 'i18next';
import moment from 'moment';

import { getProgress, getTimeLeft, renderAsync } from '../../utils';
import { AppTypography } from '../Typography';
import styles from './CurEra.module.css';

export const getEraTimeLeft = (mNow: moment.Moment, mTo: moment.Moment): string => {
  if (mNow.isAfter(mTo)) return i18next.t(`era.ended`);
  return i18next.t('era.timeLeft', { duration: getTimeLeft(mNow, mTo) });
};

export const getEraProgress = (now: Date, estEndTime: Date, startTime: Date): number => {
  return getProgress(now, startTime, estEndTime);
};

export const CurEra: React.FC = () => {
  const { currentEra } = useEra();
  const { t } = useTranslation();
  const [now, setNow] = React.useState<Date>(new Date());

  React.useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {renderAsync(currentEra, {
        loading: () => <Spinner />,
        error: (e) => <Typography>{`${t('era.currentEra')}: -`}</Typography>,
        data: (era) => {
          if (!era) return null;
          const eraHours = `${era.period / 3600}`;
          const mNow = moment(now);

          const mTo = moment(era.estEndTime);
          const progress = getEraProgress(now, era.estEndTime, era.startTime);

          return (
            <div className={styles.eraContainer}>
              <div className={styles.currentEraText}>
                <AppTypography tooltip={`${t('era.tooltip', { hour: eraHours })}`} tooltipDirection="top">
                  {`${t('era.currentEra')}: ${era.index}`}
                </AppTypography>
              </div>
              <div className={styles.eraProgress}>
                <Typography variant="small" className={styles.countdownText}>
                  {getEraTimeLeft(mNow, mTo)}
                </Typography>
              </div>
              <Progress
                strokeColor={{
                  '0%': 'var(--gradient-from)',
                  '100%': 'var(--gradient-to)',
                }}
                trailColor={'var(--gray300'}
                className={styles.progressBar}
                percent={progress}
              />
            </div>
          );
        },
      })}
    </>
  );
};
