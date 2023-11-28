// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { BsStarFill } from 'react-icons/bs';
import { useParams } from 'react-router';
import { useNavigate } from 'react-router-dom';
import { IIndexerFlexPlan, useConsumerHostServices } from '@hooks/useConsumerHostServices';
import { useGetFlexPlanPrice } from '@hooks/useGetFlexPlanPrice';
import { TableTitle } from '@subql/components';
import { renderAsync, useAsyncMemo } from '@subql/react-hooks';
import { Space, Table, TableProps } from 'antd';
import { BigNumber } from 'ethers';
import i18next, { t } from 'i18next';

import { AppTypography, EmptyList, Spinner, TableText } from '../../../components';
import { ConnectedIndexer } from '../../../components/IndexerDetails/IndexerName';
import { useRouteQuery } from '../../../hooks';
import { formatSecondsDuration, ROUTES } from '../../../utils';
import CreateHostingFlexPlan from './CreateHostingPlan/CreateHostingPlan';
import styles from './FlexPlans.module.less';

export const FlexPlans: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const query = useRouteQuery();
  const { getProjects, requestTokenLayout, checkIfHasLogin, hasLogin } = useConsumerHostServices({ autoLogin: false });
  const { getFlexPlanPrice } = useGetFlexPlanPrice();
  // TODO: confirm score threadThread with consumer host service
  const getColumns = (): TableProps<IIndexerFlexPlan>['columns'] => [
    {
      dataIndex: 'indexer',
      title: <TableTitle>{i18next.t('explorer.flexPlans.indexer')}</TableTitle>,
      render: (indexer, indexerFlexPlans) => {
        return (
          <Space className="flex">
            <div className={styles.starContainer}>
              {indexerFlexPlans.score >= 150 && <BsStarFill className={styles.star} />}
            </div>
            <ConnectedIndexer
              id={indexer}
              onClick={() => {
                navigate(`/indexer/${indexer}`);
              }}
            />
          </Space>
        );
      },
    },
    {
      dataIndex: 'price',
      title: <TableTitle>{i18next.t('general.price')}</TableTitle>,
      render: (price, record) => <TableText content={getFlexPlanPrice(price, record.price_token)} />,
    },
    {
      dataIndex: 'max_time',
      title: <TableTitle>{i18next.t('flexPlans.validityPeriod')}</TableTitle>,
      render: (max) => <TableText>{formatSecondsDuration(max)}</TableText>,
    },
  ];

  const flexPlans = useAsyncMemo(async () => {
    try {
      if (!hasLogin) return [];
      const res = await getProjects({
        projectId: BigNumber.from(id).toString(),
        deployment: query.get('deploymentId') || undefined,
      });

      if (res.data?.indexers?.length) {
        return res.data.indexers;
      }
    } catch (e) {
      return [];
    }
  }, [id, query, hasLogin]);

  React.useEffect(() => {
    if (!id) {
      navigate(ROUTES.EXPLORER);
    }
  }, [navigate, id]);

  return (
    <>
      {renderAsync(flexPlans, {
        loading: () => <Spinner />,
        error: (e) => <AppTypography type="danger">{'Failed to load flex plan.'}</AppTypography>,
        data: (flexPlans) => {
          if (!flexPlans.length && hasLogin) return <EmptyList description={t('explorer.flexPlans.non')} />;
          return (
            <>
              <CreateHostingFlexPlan></CreateHostingFlexPlan>
              {!hasLogin ? (
                requestTokenLayout('flex plan')
              ) : (
                <Table columns={getColumns()} dataSource={flexPlans} rowKey={'id'} />
              )}
            </>
          );
        },
      })}
    </>
  );
};
