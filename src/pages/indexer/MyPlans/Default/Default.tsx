// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyList } from '@components';
import { useWeb3 } from '@containers';
import { Spinner, Typography } from '@subql/components';
import { useGetPlansQuery } from '@subql/react-hooks';
import { mapAsync, notEmpty, renderAsyncArray } from '@utils';

import List from '../List';

export const Default: React.FC = () => {
  const { account } = useWeb3();
  const { t } = useTranslation();
  const plans = useGetPlansQuery({ variables: { address: account ?? '' }, pollInterval: 10000 });

  // plans.subscribeToMore({
  //   document: SUB_PLANS,
  //   updateQuery: (prev, { subscriptionData }) => {
  //     if (subscriptionData.data) {
  //       plans.refetch();
  //     }
  //     return prev;
  //   },
  // });

  return (
    <div className={'contentContainer'}>
      {renderAsyncArray(
        mapAsync((d) => d.plans?.nodes.filter(notEmpty), plans),
        {
          loading: () => <Spinner />,
          error: (e) => <Typography>{`Error loading plans: ${e}`}</Typography>,
          empty: () => (
            <EmptyList
              title={t('indexerPlans.title')}
              description={t('indexerPlans.description')}
              infoI18nKey={'indexerPlans.learnMore'}
            />
          ),
          data: (data) => <List data={data} onRefresh={plans.refetch} title={t('plans.default.title')} />,
        },
      )}
    </div>
  );
};
