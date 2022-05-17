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
import { AsyncData, convertBigNumberToNumber, formatEther, renderAsync, renderAsyncArray } from '../../utils';
import { Button, Spinner, Typography } from '@subql/react-ui';
import TransactionModal from '../TransactionModal';
import { ContractTransaction } from '@ethersproject/contracts';
import { IndexerDetails } from '../../models';
import { IndexerName } from './IndexerName';
import { ApproveContract, ModalApproveToken, tokenApprovalModalText } from '../ModalApproveToken';
import { secondsToDhms } from '../../utils/dateFormatters';
import { SummaryList } from '../SummaryList';
import styles from './IndexerDetails.module.css';
import { last } from 'ramda';
import { TableText } from '../TableText';

export type PlansTableProps = {
  loadPlans: () => void;
  asyncPlans: LazyQueryResult<Plan[], unknown>;
} & Omit<DoPurchaseProps, 'plan'>;

type DoPurchaseProps = {
  plan: Plan;
  indexerDetails?: IndexerDetails;
  purchasePlan: (indexer: string, planId?: string) => Promise<ContractTransaction>;
  balance: AsyncData<BigNumber>;
  planManagerAllowance: AsyncData<BigNumber> & { refetch: () => void };
  deploymentId?: string;
};

const DoPurchase: React.VFC<DoPurchaseProps> = ({
  plan,
  purchasePlan,
  balance,
  planManagerAllowance,
  indexerDetails,
  deploymentId,
}) => {
  const { t } = useTranslation();

  const requiresTokenApproval = planManagerAllowance.data?.isZero();

  const modalText = requiresTokenApproval
    ? tokenApprovalModalText
    : {
        title: t('plans.purchase.title'),
        steps: [t('plans.purchase.step1'), t('indexer.confirmOnMetamask')],
        failureText: t('plans.purchase.failureText'),
      };

  const planSummary = [
    {
      label: t('indexer.title'),
      value: <IndexerName name={indexerDetails?.name} image={indexerDetails?.image} address={plan.creator} />,
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
      value: plan.planTemplate?.dailyReqCap,
    },
    {
      label: t('plans.headers.rateLimit'),
      value: plan.planTemplate?.rateLimit,
    },
    {
      label: t('plans.headers.deploymentId'),
      value: deploymentId,
    },
    {
      label: t('plans.purchase.yourBalance'),
      value: renderAsync(balance, {
        loading: () => <Spinner />,
        error: () => <Typography>{t('plans.purchase.failToLoadBalance')}</Typography>,
        data: (data) => <Typography>{`${formatEther(plan.price)} SQT`}</Typography>,
      }),
    },
  ];

  return (
    <TransactionModal
      variant="textBtn"
      actions={[{ label: t('plans.purchase.submit'), key: 'purchase' }]}
      text={modalText}
      onClick={() => purchasePlan(plan.creator, last(plan.id.split(':')))}
      renderContent={(onSubmit, onCancel, isLoading, error) => {
        return renderAsync(planManagerAllowance, {
          loading: () => <Spinner />,
          error: (e) => <Typography>{`Failed to check if token needs approval: ${e.message}`}</Typography>,
          data: () => {
            if (requiresTokenApproval) {
              return (
                <ModalApproveToken
                  contract={ApproveContract.PlanManager}
                  onSubmit={() => planManagerAllowance.refetch()}
                />
              );
            }
            return (
              <div>
                <SummaryList title={t('plans.purchase.description')} list={planSummary} />

                <Typography className={'errorText'}>{error}</Typography>
                <div className={'flex-end'}>
                  <Button
                    label={t('plans.purchase.cancel')}
                    onClick={onCancel}
                    disabled={isLoading}
                    type="secondary"
                    colorScheme="neutral"
                    className={styles.btn}
                  />
                  <Button
                    label={t('plans.purchase.submit')}
                    onClick={() => {
                      onSubmit({});
                    }}
                    loading={isLoading}
                    colorScheme="standard"
                  />
                </div>
              </div>
            );
          },
        });
      }}
    />
  );
};

export const PlansTable: React.VFC<PlansTableProps> = ({ loadPlans, asyncPlans, planManagerAllowance, ...rest }) => {
  const { t } = useTranslation();

  React.useEffect(() => {
    if (!asyncPlans.called) loadPlans();
  }, [loadPlans, asyncPlans]);

  React.useEffect(() => {
    if (planManagerAllowance.error) {
      planManagerAllowance.refetch();
    }
  }, []);

  const columns: TableProps<Plan>['columns'] = [
    {
      dataIndex: 'id',
      title: '#',
      width: 30,
      align: 'center',
      render: (_: string, __: Plan, idx: number) => <TableText content={idx + 1} />,
    },
    {
      dataIndex: 'price',
      key: 'price',
      title: t('plans.headers.price'),
      align: 'center',
      render: (value: BigInt) => <TableText content={`${formatEther(value)} SQT`} />,
    },
    {
      dataIndex: 'planTemplate',
      key: 'period',
      title: t('plans.headers.period'),
      align: 'center',
      render: (value: PlanTemplate) => (
        <TableText content={secondsToDhms(convertBigNumberToNumber(value?.period ?? 0))} />
      ),
    },
    {
      dataIndex: 'planTemplate',
      key: 'dailyReqCap',
      title: t('plans.headers.dailyReqCap'),
      align: 'center',
      render: (value: PlanTemplate) => (
        <TableText content={t('plans.default.query', { count: convertBigNumberToNumber(value.dailyReqCap) })} />
      ),
    },
    {
      dataIndex: 'planTemplate',
      key: 'rateLimit',
      title: t('plans.headers.rateLimit'),
      align: 'center',
      render: (value: PlanTemplate) => (
        <TableText content={`${convertBigNumberToNumber(value.rateLimit)} ${t('plans.default.requestPerMin')}`} />
      ),
    },
    {
      dataIndex: 'id',
      key: 'action',
      title: t('plans.headers.action'),
      width: 30,
      align: 'center',
      render: (id: string, plan: Plan) => {
        return <DoPurchase {...rest} plan={plan} planManagerAllowance={planManagerAllowance} />;
      },
    },
  ];

  return (
    <div className={styles.plansTable}>
      {renderAsyncArray(asyncPlans, {
        loading: () => (
          <div className={styles.spinner}>
            <Spinner />
          </div>
        ),
        error: () => <Typography>{t('plans.purchase.failureFetchPlans')}</Typography>,
        empty: () => <Typography>{t('plans.purchase.noPlansForPurchase')}</Typography>,
        data: (data) => <Table pagination={false} columns={columns} dataSource={data} />,
      })}
    </div>
  );
};
