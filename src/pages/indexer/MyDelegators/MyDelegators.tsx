// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { renderAsync, useGetIndexerDelegatorsQuery } from '@subql/react-hooks';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { AppPageHeader, Spinner } from '../../../components';
import { useWeb3 } from '../../../containers';
import styles from './MyDelegators.module.css';
import { Typography } from '@subql/react-ui';
import { OwnDelegator } from '../../staking/Indexer/OwnDelegator';
import { SUB_DELEGATORS } from '../../../containers/IndexerRegistryProjectSub';

const NoOffers: React.VFC = () => {
  const { t } = useTranslation();
  return (
    <div className={styles.noDelegatorsContainer}>
      <Typography variant="h5">{t('myDelegators.nonDelegatorsTitle')}</Typography>
      <Typography className={styles.description}>{t('myDelegators.nonDelegatorsDescription')}</Typography>
    </div>
  );
};

export const MyDelegators: React.VFC = () => {
  const { account } = useWeb3();
  const { t } = useTranslation();
  const filterParams = { id: account ?? '', offset: 0 };
  const delegators = useGetIndexerDelegatorsQuery({ variables: filterParams });

  delegators.subscribeToMore({
    document: SUB_DELEGATORS,
    variables: filterParams,
    updateQuery: (prev, { subscriptionData }) => {
      if (subscriptionData.data) {
        delegators.refetch(filterParams);
      }
      return prev;
    },
  });

  return renderAsync(delegators, {
    loading: () => <Spinner />,
    error: (e) => <Typography>{`Failed to load delegators: ${e}`}</Typography>,
    data: (offers) => {
      const totalCount = offers.indexer?.delegations.totalCount || 0;
      return (
        <div className={styles.container}>
          <AppPageHeader
            title={t('indexer.myDelegators')}
            desc={totalCount > 0 ? t('indexer.myDelegatorsDescription') : undefined}
          />
          {totalCount <= 0 && <NoOffers />}
          {totalCount > 0 && <OwnDelegator indexer={account ?? ''} />}
        </div>
      );
    },
  });
};
