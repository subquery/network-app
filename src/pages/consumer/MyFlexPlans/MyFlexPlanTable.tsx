// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { TableTitle } from '@subql/components';
import { StateChannelFieldsFragment as ConsumerFlexPlan } from '@subql/network-query';
import { ChannelStatus } from '@subql/network-query';
import { useGetConsumerClosedFlexPlansLazyQuery, useGetConsumerOngoingFlexPlansLazyQuery } from '@subql/react-hooks';
import { TableProps, Tag, Typography } from 'antd';
import { BigNumber } from 'ethers';
import i18next from 'i18next';
import moment from 'moment';

import { AntDTable, DeploymentMeta, EmptyList, Spinner, TableText } from '../../../components';
import { ConnectedIndexer } from '../../../components/IndexerDetails/IndexerName';
import { useWeb3 } from '../../../containers';
import { formatDate, formatEther, getFlexPlanPrice, mapAsync, notEmpty, renderAsyncArray, TOKEN } from '../../../utils';
import { ROUTES } from '../../../utils';
import { ClaimFlexPlan } from './ClaimFlexPlan';
import { OngoingFlexPlanActions } from './OngoingFlexPlanActions';

const { ONGOING_PLANS_NAV, CLOSED_PLANS_NAV } = ROUTES;

const getColumns = (path: typeof ONGOING_PLANS_NAV | typeof CLOSED_PLANS_NAV, onSuccess: () => void) => {
  const columns: TableProps<ConsumerFlexPlan>['columns'] = [
    {
      dataIndex: 'id',
      title: <TableTitle title={'#'} />,
      width: 20,
      render: (_, __, idx: number) => <TableText content={idx + 1} />,
    },
    {
      dataIndex: 'deployment',
      width: 80,
      title: <TableTitle title={i18next.t('flexPlans.project')} />,
      render: ({ id, project }) => <DeploymentMeta deploymentId={id} projectMetadata={project.metadata} />,
    },
    {
      dataIndex: 'indexer',
      width: 50,
      title: <TableTitle title={i18next.t('flexPlans.indexer')} />,
      render: (indexer) => <ConnectedIndexer id={indexer} />,
    },
    {
      dataIndex: 'price',
      width: 30,
      title: <TableTitle title={i18next.t('general.price')} />,
      render: (price) => <TableText content={getFlexPlanPrice(price)} />,
    },
    {
      dataIndex: 'expiredAt',
      width: 30,
      title: (
        <TableTitle title={i18next.t(path === ONGOING_PLANS_NAV ? 'flexPlans.validityPeriod' : 'flexPlans.duration')} />
      ),
      render: (expiredAt) => {
        return <TableText content={formatDate(expiredAt)} />;
      },
    },
    {
      dataIndex: 'spent',
      width: 30,
      title: <TableTitle title={i18next.t('flexPlans.spent')} />,
      render: (spent) => <TableText content={`${formatEther(spent, 4)} ${TOKEN}`} />,
    },
    {
      dataIndex: 'spent',
      width: 30,
      title: <TableTitle title={i18next.t('flexPlans.remainDeposit')} />,
      render: (spent, plan) => {
        const sortedRemaining = BigNumber.from(plan?.total).sub(BigNumber.from(spent));
        return <TableText content={`${formatEther(sortedRemaining, 4)} ${TOKEN}`} />;
      },
    },
    {
      dataIndex: 'status',
      width: 30,
      title: <TableTitle title={i18next.t('flexPlans.channelStatus')} />,
      render: (status: ChannelStatus, plan) => {
        if (path === ONGOING_PLANS_NAV) {
          return <Tag color="green">{i18next.t('general.active')}</Tag>;
        } else if (status === ChannelStatus.FINALIZED) {
          return <Tag color="blue">{i18next.t('general.completed')}</Tag>;
        } else if (status === ChannelStatus.TERMINATING) {
          return <Tag color="yellow">{i18next.t('general.terminating')}</Tag>;
        } else {
          return <Tag color="red">{i18next.t('general.terminated')}</Tag>;
        }
      },
    },
    {
      title: <TableTitle title={i18next.t('general.action')} />,
      dataIndex: 'deploymentId',
      fixed: 'right',
      width: path === CLOSED_PLANS_NAV ? 20 : 40,
      render: (_, plan) => {
        if (path === CLOSED_PLANS_NAV) {
          return <ClaimFlexPlan flexPlan={plan} onSuccess={onSuccess} />;
        }

        return <OngoingFlexPlanActions flexPlan={plan} onSuccess={onSuccess} />;
      },
    },
  ];

  return columns;
};

interface MyFlexPlanTableProps {
  queryFn: typeof useGetConsumerOngoingFlexPlansLazyQuery | typeof useGetConsumerClosedFlexPlansLazyQuery;
}

export const MyFlexPlanTable: React.FC<MyFlexPlanTableProps> = ({ queryFn }) => {
  const { account } = useWeb3();
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const [now] = React.useState<Date>(moment().toDate());
  const sortedParams = { consumer: account ?? '', now, offset: 0 };
  const [loadFlexPlan, flexPlans] = queryFn({ variables: sortedParams, fetchPolicy: 'no-cache' });

  const fetchMoreFlexPlans = () => {
    loadFlexPlan();
  };

  React.useEffect(() => {
    if (account) {
      loadFlexPlan();
    }
  }, [account]);

  return (
    <div className="contentContainer">
      {renderAsyncArray(
        mapAsync((flexPlansChannels) => {
          return flexPlansChannels?.stateChannels?.nodes?.filter(notEmpty);
        }, flexPlans),
        {
          loading: () => <Spinner />,
          error: (e) => <Typography.Text type="danger">{`Failed to load flex plans: ${e}`}</Typography.Text>,
          empty: () => <EmptyList title={t('flexPlans.non')} description={t('myFlexPlans.description')} />,
          data: (flexPlanList) => {
            return (
              <div>
                <AntDTable
                  tableProps={{
                    columns: getColumns(pathname, fetchMoreFlexPlans),
                    dataSource: flexPlanList,
                    scroll: { x: 2000 },
                    rowKey: 'expiredAt',
                  }}
                />
              </div>
            );
          },
        },
      )}
    </div>
  );
};
