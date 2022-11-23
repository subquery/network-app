// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Button, TableProps, Tag, Typography } from 'antd';
import { BigNumber } from 'ethers';
import i18next from 'i18next';
import moment from 'moment';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { AntDTable, DeploymentMeta, Spinner, TableText } from '../../../components';
import { TableTitle } from '../../../components/TableTitle';
import { useConsumerClosedFlexPlans, useConsumerOpenFlexPlans, useWeb3 } from '../../../containers';
import { formatEther, getFlexPlanPrice, mapAsync, notEmpty, renderAsyncArray, TOKEN } from '../../../utils';
import { GetOngoingFlexPlan_stateChannels_nodes as ConsumerFlexPlans } from '../../../__generated__/registry/GetOngoingFlexPlan';
import { ChannelStatus } from '../../../__generated__/registry/globalTypes';
import { EmptyList } from '../Plans/EmptyList';
import { EXPIRED_PLANS, ONGOING_PLANS } from './MyFlexPlans';

const getColumns = (path: typeof ONGOING_PLANS | typeof EXPIRED_PLANS) => {
  const columns: TableProps<ConsumerFlexPlans>['columns'] = [
    {
      dataIndex: 'id',
      title: '#',
      width: 60,
      render: (_, __, idx: number) => <TableText content={idx + 1} />,
    },
    {
      dataIndex: 'deploymentId',
      title: <TableTitle title={i18next.t('flexPlans.project')} />,
      render: (deploymentId) => <DeploymentMeta deploymentId={deploymentId} />,
    },
    {
      dataIndex: 'indexer',
      title: <TableTitle title={i18next.t('flexPlans.indexer')} />,
      render: (indexer) => <TableText content={indexer} />,
    },
    {
      dataIndex: 'price',
      title: <TableTitle title={i18next.t('flexPlans.price')} />,
      render: (price) => <TableText content={getFlexPlanPrice(price)} />,
    },
    {
      dataIndex: 'expiredAt',
      title: (
        <TableTitle title={i18next.t(path === ONGOING_PLANS ? 'flexPlans.validityPeriod' : 'flexPlans.duration')} />
      ),
      render: (expiredAt, plan) => {
        return <TableText content={expiredAt} />;
      },
    },
    {
      dataIndex: 'spent',
      title: <TableTitle title={i18next.t('flexPlans.spent')} />,
      render: (spent) => <TableText content={`${formatEther(spent, 4)} ${TOKEN}`} />,
    },
    {
      dataIndex: 'spent',
      title: <TableTitle title={i18next.t('flexPlans.remainDeposit')} />,
      render: (spent, plan) => {
        const sortedRemaining = BigNumber.from(plan?.total).sub(BigNumber.from(spent));
        return <TableText content={`${formatEther(sortedRemaining, 4)} ${TOKEN}`} />;
      },
    },
    {
      dataIndex: 'status',
      title: <TableTitle title={i18next.t('flexPlans.channelStatus')} />,
      render: (status: ChannelStatus, plan) => {
        if (path === ONGOING_PLANS) {
          return <Tag color="green">{i18next.t('general.active')}</Tag>;
        } else if (status === ChannelStatus.FINALIZED) {
          return <Tag color="red">{i18next.t('general.completed')}</Tag>;
        } else if (status === ChannelStatus.TERMINATING) {
          return <Tag color="red">{i18next.t('general.terminating')}</Tag>;
        } else {
          return <Tag color="red">{i18next.t('general.terminated')}</Tag>;
        }
      },
    },
    {
      title: <TableTitle title={i18next.t('general.action')} />,
      dataIndex: 'deploymentId',
      fixed: 'right',
      align: 'center',
      width: 100,
      render: (deploymentId) => {
        return <Button>Action</Button>;
      },
    },
  ];

  return columns;
};

interface MyFlexPlanTableProps {
  queryFn: typeof useConsumerOpenFlexPlans | typeof useConsumerClosedFlexPlans;
}

export const MyFlexPlanTable: React.FC<MyFlexPlanTableProps> = ({ queryFn }) => {
  const { t } = useTranslation();
  const { account } = useWeb3();
  const { pathname } = useLocation();
  const [now, setNow] = React.useState<Date>(moment().toDate());
  const sortedParams = { consumer: account ?? '', now };
  const flexPlans = queryFn(sortedParams);

  const fetchMoreFlexPlans = (offset: number) => {
    flexPlans.fetchMore({
      variables: {
        offset,
        ...sortedParams,
      },
      updateQuery: (previous, { fetchMoreResult }) => {
        if (!fetchMoreResult) return previous;
        return { ...fetchMoreResult };
      },
    });
  };

  React.useEffect(() => {
    const interval = setInterval(() => {
      setNow(moment().toDate());
    }, 30000);
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
                    columns: getColumns(pathname),
                    dataSource: flexPlanList,
                    scroll: { x: 2000 },
                    rowKey: 'deploymentId',
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
