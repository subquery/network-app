// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { AppPageHeader, EmptyList, Spinner, WalletRoute } from '@components';
import { useWeb3 } from '@containers';
import { Typography } from '@subql/components';
import { renderAsync, useGetIndexerDelegatorsQuery } from '@subql/react-hooks';
import { URLS } from '@utils';

import styles from './MyDelegators.module.css';
import { OwnDelegator } from './OwnDelegator';

const NoDelegator: React.FC = () => {
  const { t } = useTranslation();
  return (
    <EmptyList
      title={t('myDelegators.noDelegatorsTitle')}
      description={t('myDelegators.noDelegatorsDescription')}
      infoI18nKey={t('myDelegators.noDelegatorsInfoLink')}
      infoLinkDesc={t('myDelegators.noDelegatorsInfoLink')}
      infoLink={URLS.DELEGATOR}
    />
  );
};

// TODO: move NoDelegator to OwnDelegator for indexer details consideration
// TODO: OwnDelegator -> OwnDelegatorTable
// TODO: pass delegators data to OwnDelegator
export const MyDelegators: React.FC = () => {
  const { account } = useWeb3();
  const { t } = useTranslation();
  const filterParams = { id: account ?? '', offset: 0 };
  const delegators = useGetIndexerDelegatorsQuery({ variables: filterParams, pollInterval: 10000 });

  // delegators.subscribeToMore({
  //   document: SUB_DELEGATORS,
  //   variables: filterParams,
  //   updateQuery: (prev, { subscriptionData }) => {
  //     if (subscriptionData.data) {
  //       delegators.refetch(filterParams);
  //     }
  //     return prev;
  //   },
  // });

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
          <WalletRoute
            componentMode
            element={
              <>
                {totalCount <= 0 && <NoDelegator />}
                {totalCount > 0 && <OwnDelegator indexer={account ?? ''} />}
              </>
            }
          ></WalletRoute>
        </div>
      );
    },
  });
};
