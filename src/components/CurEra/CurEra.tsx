// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Spinner, Typography } from '@subql/react-ui';
import { Progress, Tooltip } from 'antd';
import moment from 'moment';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useEra } from '../../containers';
import { getPeriod, getProgress, renderAsync } from '../../utils';
import { AppTypography } from '../Typography';
import styles from './CurEra.module.css';

export const CurEra: React.FC = () => {
  const { currentEra } = useEra();
  const { t } = useTranslation();

  return (
    <>
      {renderAsync(currentEra, {
        loading: () => <Spinner />,
        error: (e) => <Typography>{`${t('indexer.currentEra')}: -`}</Typography>,
        data: (era) => {
          if (!era) return null;
          const now = new Date();
          const mNow = moment(now);
          const mTo = moment(era.estEndTime);
          const progress = getProgress(now, era.startTime, era.estEndTime);

          return (
            <div className={styles.eraContainer}>
              <div className={styles.currentEraText}>
                <AppTypography tooltip="1 era = x days" tooltipDirection="top">
                  {`${t('indexer.currentEra')}: ${era.index}`}
                </AppTypography>
              </div>
              <Typography variant="small" className={styles.countdownText}>
                Ends in {getPeriod(mNow, mTo)}
              </Typography>
              <Progress
                strokeColor={{
                  '0%': '#4289DE',
                  '100%': '#EA4D8A',
                }}
                percent={progress / 100}
              />
            </div>
          );
        },
      })}
    </>
  );
};
