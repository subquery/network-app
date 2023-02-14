// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Spinner, Typography } from '@subql/react-ui';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useWeb3 } from '../../../../containers';
import { mapAsync, notEmpty, renderAsyncArray } from '../../../../utils';
import List from '../List';
import { NoPlans } from '../NoPlans';
import { useGetPlansQuery } from '@subql/react-hooks';

export const Default: React.VFC = () => {
  const { account } = useWeb3();
  const { t } = useTranslation();
  const plans = useGetPlansQuery({ variables: { address: account ?? '' } });

  return (
    <div className={'contentContainer'}>
      {renderAsyncArray(
        mapAsync((d) => d.plans?.nodes.filter(notEmpty), plans),
        {
          loading: () => <Spinner />,
          error: (e) => <Typography>{`Error loading plans: ${e}`}</Typography>,
          empty: () => <NoPlans />,
          data: (data) => <List data={data} onRefresh={plans.refetch} title={t('plans.default.title')} />,
        },
      )}
    </div>
  );
};
