// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { SummaryList, TableText } from '@components';
import TransactionModal from '@components/TransactionModal';
import { NETWORK_NAME } from '@containers/Web3';
import { useWaitTransactionhandled } from '@hooks/useWaitTransactionHandled';
import { Button, Tag, Typography } from '@subql/components';
import { TableTitle } from '@subql/components';
import { PlansNodeFieldsFragment as Plan } from '@subql/network-query';
import { PlanTemplateFieldsFragment as PlanTemplate } from '@subql/network-query';
import { useStableCoin } from '@subql/react-hooks';
import { convertBigNumberToNumber } from '@utils';
import { formatSecondsDuration } from '@utils/dateFormatters';
import { Table, TableProps } from 'antd';
import assert from 'assert';
import clsx from 'clsx';
import { last } from 'ramda';

import { useWeb3Store } from 'src/stores';

import styles from './List.module.less';

type Props = {
  data: Plan[];
  onRefresh: () => void;
  title?: string;
};

const List: React.FC<Props> = ({ data, onRefresh, title }) => {
  const { t } = useTranslation();
  const { contracts } = useWeb3Store();
  const { pricePreview } = useStableCoin(contracts, NETWORK_NAME);
  const waitTransactionHandled = useWaitTransactionhandled();

  const handleRemovePlan = async (id: string) => {
    assert(contracts, 'Contracts not available');

    const planId = last(id.split(':'));

    assert(planId, 'Unable to get planId');

    const pendingTx = await contracts.planManager.removePlan(planId);
    const receipt = await pendingTx.wait();
    await waitTransactionHandled(receipt.blockNumber);
    await onRefresh();

    return pendingTx;
  };

  const columns: TableProps<Plan>['columns'] = [
    {
      dataIndex: 'id',
      title: <TableTitle title={'#'} />,
      width: 30,
      render: (text: string, _: unknown, idx: number) => <TableText content={idx + 1} />,
    },
    {
      dataIndex: 'planTemplate',
      key: 'price',
      title: <TableTitle title={t('plans.headers.price')} />,
      render: (value: PlanTemplate, record) => {
        return <TableText content={pricePreview(value.priceToken, record.price)} />;
      },
    },
    {
      dataIndex: 'planTemplate',
      key: 'period',
      title: <TableTitle title={t('plans.headers.period')} />,
      render: (value: PlanTemplate) => (
        <TableText content={formatSecondsDuration(convertBigNumberToNumber(value.period))} />
      ),
    },
    {
      dataIndex: 'planTemplate',
      key: 'dailyReqCap',
      title: <TableTitle title={t('plans.headers.dailyReqCap')} />,
      align: 'center',
      render: (value: PlanTemplate) => (
        <TableText content={t('plans.default.query', { count: convertBigNumberToNumber(value.dailyReqCap) })} />
      ),
    },
    {
      dataIndex: 'planTemplate',
      key: 'rateLimit',
      title: <TableTitle title={t('plans.headers.rateLimit')} />,
      align: 'center',
      render: (value: PlanTemplate) => (
        <TableText content={`${convertBigNumberToNumber(value.rateLimit)} ${t('plans.default.requestPerMin')}`} />
      ),
    },
    {
      dataIndex: 'planTemplate',
      key: 'status',
      title: <TableTitle title={t('general.status')}></TableTitle>,
      align: 'center',
      render: (val: PlanTemplate, record) => {
        const text = () => {
          if (val.active && record.active) {
            return 'active';
          }

          if (!record.active) {
            return 'inactive';
          }

          if (!val.active) {
            return 'template inactive';
          }

          return 'inactive';
        };
        return (
          <Tag color={text().includes('inactive') ? 'error' : 'success'} style={{ textTransform: 'uppercase' }}>
            {text()}
          </Tag>
        );
      },
    },
    {
      dataIndex: 'id',
      key: 'action',
      title: <TableTitle title={t('plans.headers.action')} />,
      width: 50,
      align: 'center',
      render: (id: string, plan: Plan) => (
        <TransactionModal
          actions={[
            {
              label: t('plans.remove.action'),
              key: 'remove',
            },
          ]}
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
                value: (
                  <div style={{ textAlign: 'end' }}>{pricePreview(plan.planTemplate?.priceToken, plan.price)}</div>
                ),
              },
              {
                label: t('plans.headers.period'),
                value: formatSecondsDuration(convertBigNumberToNumber(plan.planTemplate?.period ?? 0)),
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
      title={title ? () => <Typography variant="h6">{title}</Typography> : undefined}
    />
  );
};

export default List;
