// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Table, TableProps } from 'antd';
import {
  GetPlans_plans_nodes as Plan,
  GetPlans_plans_nodes_planTemplate as PlanTemplate,
} from '../../../../__generated__/GetPlans';
import { useTranslation } from 'react-i18next';
import { formatEther } from '@ethersproject/units';
import { BigNumber } from '@ethersproject/bignumber';
import { Typography } from '@subql/react-ui';
import TransactionModal from '../../../../components/TransactionModal';
import { useContracts } from '../../../../containers';
import assert from 'assert';

type Props = {
  data: Plan[];
};

const List: React.FC<Props> = ({ data }) => {
  const { t } = useTranslation();
  const pendingContracts = useContracts();

  const handleRemovePlan = async (id: string) => {
    const contracts = await pendingContracts;
    assert(contracts, 'Contracts not available');

    return contracts.planManager.removePlan(id);
  };

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
      render: (id: string) => (
        <TransactionModal
          actions={[{ label: t('plans.remove.action'), key: 'remove' }]}
          text={{
            title: t('plans.remove.title'),
            description: t('plans.remove.description'),
            steps: [], // Should ui have this?
            submitText: '',
            inputTitle: '',
            failureText: 'Failed ',
          }}
          onClick={() => handleRemovePlan(id)}
          renderContent={() => {
            // TODO show plan details
            return <></>;
          }}
        />
      ),
    },
  ];

  return <Table columns={columns} dataSource={data} />;
};

export default List;
