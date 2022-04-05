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
import { SummaryList } from '../../../../components';
import styles from './List.module.css';
import clsx from 'clsx';
import { secondsToDhms } from '../../../../utils/dateFormatters';

type Props = {
  data: Plan[];
  onRefresh: () => void;
};

const List: React.FC<Props> = ({ data, onRefresh }) => {
  const { t } = useTranslation();
  const pendingContracts = useContracts();

  const handleRemovePlan = async (id: string) => {
    const contracts = await pendingContracts;
    assert(contracts, 'Contracts not available');

    const pendingTx = contracts.planManager.removePlan(id);

    pendingTx.then((tx) => tx.wait()).then(() => onRefresh());

    return pendingTx;
  };

  const columns: TableProps<Plan>['columns'] = [
    {
      dataIndex: 'id',
      title: '#',
      width: 30,
      align: 'center',
      render: (text: string, _: any, idx: number) => <Typography>{idx + 1}</Typography>,
    },
    {
      dataIndex: 'price',
      key: 'price',
      title: t('plans.headers.price'),
      align: 'center',
      render: (value: BigInt) => <Typography>{`${formatEther(value)} SQT`}</Typography>,
    },
    {
      dataIndex: 'planTemplate',
      key: 'period',
      title: t('plans.headers.period'),
      align: 'center',
      render: (value: PlanTemplate) => <Typography>{secondsToDhms(convertBigNumberToNumber(value.period))}</Typography>,
    },
    {
      dataIndex: 'planTemplate',
      key: 'dailyReqCap',
      title: t('plans.headers.dailyReqCap'),
      align: 'center',
      render: (value: PlanTemplate) => <Typography>{`${convertBigNumberToNumber(value.dailyReqCap)}`}</Typography>,
    },
    {
      dataIndex: 'planTemplate',
      key: 'rateLimit',
      title: t('plans.headers.rateLimit'),
      align: 'center',
      render: (value: PlanTemplate) => <Typography>{`${convertBigNumberToNumber(value.rateLimit)}`}</Typography>,
    },
    {
      dataIndex: 'id',
      key: 'action',
      title: t('plans.headers.action'),
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
          onClick={() => handleRemovePlan(id)}
          renderContent={(onClick, onCancel, isLoading, error) => {
            const planDetails = [
              {
                label: t('plans.headers.price'),
                value: `${formatEther(plan.price)} SQT`,
              },
              {
                label: t('plans.headers.period'),
                value: `${convertBigNumberToNumber(plan.planTemplate?.period ?? 0)} days`,
              },
              {
                label: t('plans.headers.dailyReqCap'),
                value: `${convertBigNumberToNumber(plan.planTemplate?.dailyReqCap ?? 0)}`,
              },
              {
                label: t('plans.headers.rateLimit'),
                value: `${convertBigNumberToNumber(plan.planTemplate?.rateLimit ?? 0)}`,
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

  return <Table columns={columns} dataSource={data} rowKey={'id'} />;
};

export default List;
