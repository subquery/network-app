// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Spinner, Typography } from '@subql/react-ui';
import { Progress } from 'antd';
import i18next from 'i18next';
import moment from 'moment';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useEra } from '../../containers';
import { getTimeLeft, getProgress, renderAsync } from '../../utils';
import { AppTypography } from '../Typography';
import styles from './CurEra.module.css';

const getEraTimeLeft = (mNow: moment.Moment, mTo: moment.Moment): string => {
  if (mNow.isAfter(mTo)) return i18next.t(`era.ended`);
  return i18next.t('era.timeLeft', { duration: getTimeLeft(mNow, mTo) });
};

const getEraProgress = (now: Date, estEndTime: Date, startTime: Date): number => {
  return getProgress(now, startTime, estEndTime);
};

export const CurEra: React.FC = () => {
  const { currentEra } = useEra();
  const { t } = useTranslation();

  return (
    <>
      {renderAsync(currentEra, {
        loading: () => <Spinner />,
        error: (e) => <Typography>{`${t('era.currentEra')}: -`}</Typography>,
        data: (era) => {
          if (!era) return null;
          const now = new Date();
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
