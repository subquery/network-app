// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useState } from 'react';
import { getEraProgress, getEraTimeLeft } from '@components';
import NewCard from '@components/NewCard';
import { useEra } from '@hooks';
import { Typography } from '@subql/components';
import { renderAsync } from '@subql/react-hooks';
import { parseError } from '@utils';
import { useInterval } from 'ahooks';
import { Progress, Skeleton } from 'antd';
import { t } from 'i18next';
import moment from 'moment';

export const EraCard = () => {
  const { currentEra } = useEra();
  const [now, setNow] = useState(new Date());
  useInterval(
    () => {
      setNow(new Date());
    },
    5000,
    { immediate: true },
  );

  return (
    <>
      {renderAsync(currentEra, {
        loading: () => <Skeleton active></Skeleton>,
        error: (e) => <>{parseError(e)}</>,
        data: (eraData) => (
          <NewCard
            title="Current Era"
            titleExtra={
              <div className="col-flex">
                <Typography variant="h5" style={{ color: 'var(--sq-blue600)' }}>
                  {eraData.index}
                </Typography>

                <Typography variant="small" type="secondary" style={{ marginBottom: 12 }}>
                  {getEraTimeLeft(moment(now), moment(eraData.estEndTime))}
                </Typography>
                <Progress
                  strokeColor={{
                    '0%': 'var(--gradient-from)',
                    '100%': 'var(--gradient-to)',
                  }}
                  trailColor={'var(--gray300'}
                  percent={getEraProgress(now, eraData.estEndTime, eraData.startTime)}
                />
              </div>
            }
            tooltip={t('era.tooltip', { hour: eraData.period / 3600 })}
            width={302}
          ></NewCard>
        ),
      })}
    </>
  );
};
