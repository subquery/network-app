// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { useRouteQuery } from '@hooks';
import { TableTitle, Typography } from '@subql/components';
import { StateChannelFieldsFragment as ConsumerFlexPlan } from '@subql/network-query';
import { ChannelStatus } from '@subql/network-query';
import { useGetConsumerFlexPlansByDeploymentIdLazyQuery } from '@subql/react-hooks';
import { TableProps, Tag } from 'antd';
import dayjs from 'dayjs';
import { BigNumber } from 'ethers';
import i18next from 'i18next';

import { AntDTable, DeploymentMeta, EmptyList, Spinner, TableText } from '../../../components';
import { ConnectedIndexer } from '../../../components/IndexerDetails/IndexerName';
import { useWeb3 } from '../../../containers';
import { formatDate, formatEther, getFlexPlanPrice, mapAsync, notEmpty, renderAsyncArray, TOKEN } from '../../../utils';
import { ROUTES } from '../../../utils';
import { ClaimFlexPlan } from './ClaimFlexPlan';
import { OngoingFlexPlanActions } from './OngoingFlexPlanActions';

const { ONGOING_PLANS_NAV, CLOSED_PLANS_NAV } = ROUTES;

export const MyFlexPlanTable: React.FC = () => {
  const { account } = useWeb3();
  const { pathname } = useLocation();
  const query = useRouteQuery();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const sortedParams = {
    consumer: account ?? '',
    now: dayjs('1970-1-1').toDate(),
    offset: 0,
    deploymentId: query.get('deploymentId') || '',
  };
  const [loadFlexPlan, flexPlans] = useGetConsumerFlexPlansByDeploymentIdLazyQuery({
    variables: sortedParams,
    fetchPolicy: 'no-cache',
  });

  const fetchMoreFlexPlans = () => {
    loadFlexPlan();
  };

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
        render: (indexer) => (
          <ConnectedIndexer
            id={indexer}
            onClick={() => {
              navigate(`/indexer/${indexer}`);
            }}
          />
        ),
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
        title: <TableTitle title={i18next.t('flexPlans.validityPeriod')} />,
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
          if (status === ChannelStatus.OPEN && +new Date(plan.expiredAt) > +new Date()) {
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
        width: 40,
        render: (_, plan) => {
          if (plan.status === ChannelStatus.OPEN && +new Date(plan.expiredAt) > +new Date()) {
            return <OngoingFlexPlanActions flexPlan={plan} onSuccess={onSuccess} />;
          }

          return <ClaimFlexPlan flexPlan={plan} onSuccess={onSuccess} />;
        },
      },
    ];

    return columns;
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
          error: (e) => <Typography type="danger">{`Failed to load flex plans: ${e}`}</Typography>,
          empty: () => <EmptyList title={t('flexPlans.non')} description={t('myFlexPlans.description')} />,
          data: (flexPlanList) => {
            return (
              <div
                style={{
                  borderRadius: 8,
                  border: '1px solid var(--Card-boder, rgba(223, 227, 232, 0.60))',
                  background: '#fff',
                  padding: 24,
                }}
              >
                <Typography variant="large" style={{ marginBottom: 22 }}>
                  {query.get('projectName')}
                </Typography>
                <AntDTable
                  tableProps={{
                    columns: getColumns(
                      pathname as typeof ONGOING_PLANS_NAV | typeof CLOSED_PLANS_NAV,
                      fetchMoreFlexPlans,
                    ),
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
