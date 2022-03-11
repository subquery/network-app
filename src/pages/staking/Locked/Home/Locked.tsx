// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Spinner, Typography } from '@subql/react-ui';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './Locked.module.css';
import { useWeb3, useWithdrawls } from '../../../../containers';
import { mapAsync, notEmpty, renderAsyncArray } from '../../../../utils';
import { LockedList } from '../LockedList';

export const Locked: React.VFC = () => {
  const { t } = useTranslation();
  const { account } = useWeb3();
  const withdrawals = useWithdrawls({ delegator: account || '' });

  return (
    <div className={styles.container}>
      {renderAsyncArray(
        mapAsync((data) => data.withdrawls?.nodes.filter(notEmpty), withdrawals),
        {
          error: (e) => <Typography>{`Error: Fail to get Indexers ${e.message}`}</Typography>,
          loading: () => <Spinner />,
          empty: () => <Typography variant="h5">{t('withdrawals.noWithdrawals')}</Typography>,
          data: (data) => <LockedList withdrawals={data} />,
        },
      )}
    </div>
  );
};
