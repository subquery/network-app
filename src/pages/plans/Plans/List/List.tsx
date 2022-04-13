// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Table, TableProps } from 'antd';
import {
  GetPlans_plans_nodes as Plan,
  GetPlans_plans_nodes_planTemplate as PlanTemplate,
} from '../../../../__generated__/GetPlans';
import { useTranslation } from 'react-i18next';
import { Button, Typography } from '@subql/react-ui';
import TransactionModal from '../../../../components/TransactionModal';
import { useContracts } from '../../../../containers';
import assert from 'assert';
import { convertBigNumberToNumber, formatEther } from '../../../../utils';
import { SummaryList, TableText } from '../../../../components';
import styles from './List.module.css';
import clsx from 'clsx';
import { secondsToDhms } from '../../../../utils/dateFormatters';
import { last } from 'ramda';

type Props = {
  data: Plan[];
  onRefresh: () => void;
  title?: string;
};

const List: React.FC<Props> = ({ data, onRefresh, title }) => {
  const { t } = useTranslation();
  const pendingContracts = useContracts();

  const handleRemovePlan = async (id: string) => {
    const contracts = await pendingContracts;
    assert(contracts, 'Contracts not available');

    const planId = last(id.split(':'));

    assert(planId, 'Unable to get planId');

    const pendingTx = contracts.planManager.removePlan(planId);

    pendingTx.then((tx) => tx.wait()).then(() => onRefresh());

    return pendingTx;
  };

  const columns: TableProps<Plan>['columns'] = [
    {
      dataIndex: 'id',
      title: '#',
      width: 30,
      render: (text: string, _: any, idx: number) => <TableText content={idx + 1} />,
    },
    {
      dataIndex: 'price',
      key: 'price',
      title: t('plans.headers.price').toUpperCase(),
      render: (value: BigInt) => <TableText content={`${formatEther(value)} SQT`} />,
    },
    {
      dataIndex: 'planTemplate',
      key: 'period',
      title: t('plans.headers.period').toUpperCase(),
      render: (value: PlanTemplate) => <TableText content={secondsToDhms(convertBigNumberToNumber(value.period))} />,
    },
    {
      dataIndex: 'planTemplate',
      key: 'dailyReqCap',
      title: t('plans.headers.dailyReqCap').toUpperCase(),
      align: 'center',
      render: (value: PlanTemplate) => (
        <TableText content={t('plans.default.query', { count: convertBigNumberToNumber(value.dailyReqCap) })} />
      ),
    },
    {
      dataIndex: 'planTemplate',
      key: 'rateLimit',
      title: t('plans.headers.rateLimit').toUpperCase(),
      align: 'center',
      render: (value: PlanTemplate) => (
        <TableText content={`${convertBigNumberToNumber(value.rateLimit)} ${t('plans.default.requestPerMin')}`} />
      ),
    },
    {
      dataIndex: 'id',
      key: 'action',
      title: t('plans.headers.action').toUpperCase(),
      width: 50,
      align: 'center',
      render: (id: string, plan: Plan) => (
        <TransactionModal
          actions={[{ label: t('plans.remove.action'), key: 'remove' }]}
          text={{
            title: t('plans.remove.title'),
            steps: [], // Should ui have this?
            failureText: 'Failed ',
          }}
          variant="errTextBtn"
          onClick={() => handleRemovePlan(plan.id)}
          renderContent={(onClick, onCancel, isLoading, error) => {
            const planDetails = [
              {
                label: t('plans.headers.deploymentId'),
                value: plan.deploymentId || '-',
              },
              {
                label: t('plans.headers.price'),
                value: `${formatEther(plan.price)} SQT`,
              },
              {
                label: t('plans.headers.period'),
                value: secondsToDhms(convertBigNumberToNumber(plan.planTemplate?.period ?? 0)),
              },
              {
                label: t('plans.headers.dailyReqCap'),
                value: t('plans.default.query', {
                  count: convertBigNumberToNumber(plan.planTemplate?.dailyReqCap ?? 0),
                }),
              },
              {
                label: t('plans.headers.rateLimit'),
                value: `${convertBigNumberToNumber(plan.planTemplate?.rateLimit ?? 0)} ${t(
                  'plans.default.requestPerMin',
                )}`,
              },
            ];
            return (
              <>
                <SummaryList title={t('plans.remove.description')} list={planDetails} />

                <Typography className={'errorText'}>{error}</Typography>
                <div className={clsx('flex', 'flex-end', styles.btns)}>
                  <Button
                    label={t('plans.remove.submit')}
                    onClick={() => onClick({})}
                    loading={isLoading}
                    size="medium"
                    className={clsx('errBtn', styles.btn)}
                  />
                  <Button
                    label={t('plans.remove.cancel')}
                    onClick={onCancel}
                    className="neutralBtn"
                    disabled={isLoading}
                    size="medium"
                  />
                </div>
              </>
            );
          }}
        />
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey={'id'}
      title={() => <Typography variant="h6">{title}</Typography>}
    />
  );
};

export default List;
