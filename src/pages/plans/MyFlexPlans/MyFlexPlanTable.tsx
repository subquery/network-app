// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { TableProps, Tag, Typography } from 'antd';
import { BigNumber } from 'ethers';
import i18next from 'i18next';
import moment from 'moment';
import * as React from 'react';
import { useLocation } from 'react-router';
import { AntDTable, DeploymentMeta, Spinner, TableText } from '../../../components';
import { ConnectedIndexer } from '../../../components/IndexerDetails/IndexerName';
import { TableTitle } from '../../../components/TableTitle';
import { useConsumerClosedFlexPlans, useConsumerOpenFlexPlans, useWeb3 } from '../../../containers';
import { formatDate, formatEther, getFlexPlanPrice, mapAsync, notEmpty, renderAsyncArray, TOKEN } from '../../../utils';
import { GetOngoingFlexPlan_stateChannels_nodes as ConsumerFlexPlan } from '../../../__generated__/registry/GetOngoingFlexPlan';
import { ChannelStatus } from '../../../__generated__/registry/globalTypes';
import { EmptyList } from '../Plans/EmptyList';
import { ClaimFlexPlan } from './ClaimFlexPlan';
import { EXPIRED_PLANS, ONGOING_PLANS } from './MyFlexPlans';
import { OngoingFlexPlanActions } from './OngoingFlexPlanActions';

const getColumns = (path: typeof ONGOING_PLANS | typeof EXPIRED_PLANS, onSuccess: () => void) => {
  const columns: TableProps<ConsumerFlexPlan>['columns'] = [
    {
      dataIndex: 'id',
      title: '#',
      width: 20,
      render: (_, __, idx: number) => <TableText content={idx + 1} />,
    },
    {
      dataIndex: 'deployment',
      width: 120,
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
        <TableTitle title={i18next.t(path === ONGOING_PLANS ? 'flexPlans.validityPeriod' : 'flexPlans.duration')} />
      ),
      render: (expiredAt) => <TableText content={formatDate(expiredAt)} />,
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
        if (path === ONGOING_PLANS) {
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
      width: path === EXPIRED_PLANS ? 20 : 40,
      render: (_, plan) => {
        if (path === EXPIRED_PLANS) {
          return <ClaimFlexPlan flexPlan={plan} onSuccess={onSuccess} />;
        }

        return <OngoingFlexPlanActions flexPlan={plan} onSuccess={onSuccess} />;
      },
    },
  ];

  return columns;
};

interface MyFlexPlanTableProps {
  queryFn: typeof useConsumerOpenFlexPlans | typeof useConsumerClosedFlexPlans;
}

export const MyFlexPlanTable: React.FC<MyFlexPlanTableProps> = ({ queryFn }) => {
  const { account } = useWeb3();
  const { pathname } = useLocation();
  const [now, setNow] = React.useState<Date>(moment().toDate());
  const sortedParams = { consumer: account ?? '', now };
  const flexPlans = queryFn(sortedParams);

  const fetchMoreFlexPlans = (offset?: number) => {
    flexPlans.fetchMore({
      variables: {
        offset,
        consumer: account ?? '',
        now: moment().toDate(),
      },
      updateQuery: (previous, { fetchMoreResult }) => {
        if (!fetchMoreResult) return previous;
        return { ...fetchMoreResult };
      },
    });
  };

  React.useEffect(() => {
    const interval = setInterval(() => {
      fetchMoreFlexPlans(); // Cache to avoid re-render
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="contentContainer">
      {renderAsyncArray(
        mapAsync((d) => {
          return d?.stateChannels?.nodes?.filter(notEmpty);
        }, flexPlans),
        {
          loading: () => <Spinner />,
          error: (e) => <Typography.Text type="danger">{`Failed to load flex plans: ${e}`}</Typography.Text>,
          empty: () => <EmptyList i18nKey={'flexPlans.non'} />,
          data: (flexPlanList) => {
            return (
              <div>
                <AntDTable
                  customPagination
                  tableProps={{
                    columns: getColumns(pathname, fetchMoreFlexPlans),
                    dataSource: flexPlanList,
                    scroll: { x: 2000 },
                    rowKey: 'expiredAt',
                  }}
                  paginationProps={{
                    total: flexPlans.data?.stateChannels?.totalCount,
                    onChange: (page, pageSize) => {
                      fetchMoreFlexPlans?.((page - 1) * pageSize);
                    },
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
