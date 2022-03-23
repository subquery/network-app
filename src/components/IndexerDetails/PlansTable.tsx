// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import {
  GetDeploymentPlans_plans_nodes as Plan,
  GetDeploymentPlans_plans_nodes_planTemplate as PlanTemplate,
} from '../../__generated__/GetDeploymentPlans';
import { Table, TableProps } from 'antd';
import { LazyQueryResult } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { BigNumber } from '@ethersproject/bignumber';
import { formatEther, renderAsyncArray } from '../../utils';
import { Button, Spinner, Typography } from '@subql/react-ui';

export type PlansTableProps = {
  loadPlans: () => void;
  asyncPlans: LazyQueryResult<Plan[], unknown>;
};

const PlansTable: React.VFC<PlansTableProps> = ({ loadPlans, asyncPlans }) => {
  const { t } = useTranslation();

  React.useEffect(() => {
    if (!asyncPlans.called) loadPlans();
  }, [loadPlans, asyncPlans]);

  const columns: TableProps<Plan>['columns'] = [
    {
      dataIndex: 'id',
      title: t('plans.headers.id'),
      width: 30,
      render: (text: string) => <Typography>{text}</Typography>,
    },
    {
      dataIndex: 'price',
      key: 'price',
      title: t('plans.headers.price'),
      render: (value: BigInt) => <Typography>{`${formatEther(BigNumber.from(value))} SQT`}</Typography>,
    },
    {
      dataIndex: 'planTemplate',
      key: 'period',
      title: t('plans.headers.period'),
      render: (value: PlanTemplate) => <Typography>{`${BigNumber.from(value.period).toNumber()} Days`}</Typography>,
    },
    {
      dataIndex: 'planTemplate',
      key: 'dailyReqCap',
      title: t('plans.headers.dailyReqCap'),
      render: (value: PlanTemplate) => <Typography>{`${BigNumber.from(value.dailyReqCap).toNumber()}`}</Typography>,
    },
    {
      dataIndex: 'planTemplate',
      key: 'rateLimit',
      title: t('plans.headers.rateLimit'),
      render: (value: PlanTemplate) => <Typography>{`${BigNumber.from(value.rateLimit).toNumber()}`}</Typography>,
    },
    {
      dataIndex: 'id',
      key: 'action',
      title: t('plans.headers.action'),
      render: () => <Button label="purchase" />,
    },
  ];

  return renderAsyncArray(asyncPlans, {
    loading: () => <Spinner />,
    error: () => <Typography>Failed to get plans for indexer</Typography>,
    empty: () => <Typography>This indexer has no plans</Typography>,
    data: (data) => <Table columns={columns} dataSource={data} />,
  });
};

export default PlansTable;
