// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Spinner, Typography } from '@subql/react-ui';
import moment from 'moment';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useWeb3, useWithdrawls } from '../../../../containers';
import { useLockPeriod } from '../../../../hooks';
import { mapAsync, mergeAsync, notEmpty, renderAsyncArray } from '../../../../utils';
import { LockedList } from '../LockedList';

export const Locked: React.VFC = () => {
  const { t } = useTranslation();
  const { account } = useWeb3();
  const withdrawals = useWithdrawls({ delegator: account || '' });
  const lockPeriod = useLockPeriod();

  return (
    <div className={'contentContainer'}>
      {renderAsyncArray(
        mapAsync(
          ([withdrawlsResult, lockPeriod]) =>
            withdrawlsResult?.withdrawls?.nodes.filter(notEmpty).map((withdrawal, idx) => {
              const startAt = moment(withdrawal?.startTime).format();
              const endAt = moment(startAt).add(lockPeriod, 'second').format();
              const status = moment().format() > endAt ? t('withdrawals.unlock') : t('withdrawals.lock');
              return { ...withdrawal, startAt, endAt, status, idx };
            }),
          mergeAsync(withdrawals, lockPeriod),
        ),
        {
          error: (e) => <Typography>{`Error: Fail to get Indexers ${e.message}`}</Typography>,
          loading: () => <Spinner />,
          empty: () => <Typography variant="h6">{t('withdrawals.noWithdrawals')}</Typography>,
          data: (data) => <LockedList withdrawals={data} />,
        },
      )}
    </div>
  );
};
