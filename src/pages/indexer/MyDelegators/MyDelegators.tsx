// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AppPageHeader } from '@components/AppPageHeader';
import { EmptyList } from '@components/EmptyList';
import { WalletRoute } from '@components/WalletRoute';
import { useWeb3 } from '@containers';
import { Spinner, Typography } from '@subql/components';
import { renderAsync, useGetIndexerDelegatorsQuery } from '@subql/react-hooks';
import { URLS } from '@utils';

import styles from './MyDelegators.module.css';
import { OwnDelegator } from './OwnDelegator';

export const NoDelegator: React.FC = () => {
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
  const delegators = useGetIndexerDelegatorsQuery({ variables: filterParams });

  const totalCount = useMemo(() => delegators.data?.indexer?.delegations.totalCount || 0, [delegators.data]);

  return (
    <div className={styles.container}>
      <AppPageHeader
        title={t('indexer.myDelegators')}
        desc={totalCount > 0 ? t('indexer.myDelegatorsDescription') : undefined}
      />
      {renderAsync(delegators, {
        loading: () => <Spinner />,
        error: (e) => <Typography>{`Failed to load delegators: ${e}`}</Typography>,
        data: (offers) => {
          return (
            <WalletRoute
              componentMode
              element={
                <>
                  <OwnDelegator showEmpty={totalCount <= 0} indexer={account ?? ''} />
                </>
              }
            ></WalletRoute>
          );
        },
      })}
    </div>
  );
};

export default MyDelegators;
