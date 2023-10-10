// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { BsStarFill } from 'react-icons/bs';
import { useParams } from 'react-router';
import { useNavigate } from 'react-router-dom';
import { useGetFlexPlanPrice } from '@hooks/useGetFlexPlanPrice';
import { TableTitle } from '@subql/components';
import { renderAsync } from '@subql/react-hooks';
import { Space, Table, TableProps } from 'antd';
import { BigNumber } from 'ethers';
import i18next, { t } from 'i18next';

import { AppTypography, EmptyList, Spinner, TableText } from '../../../components';
import { ConnectedIndexer } from '../../../components/IndexerDetails/IndexerName';
import { IIndexerFlexPlan, useIndexerFlexPlans } from '../../../hooks';
import { formatSecondsDuration, ROUTES } from '../../../utils';
import CreateHostingFlexPlan from './CreateHostingPlan/CreateHostingPlan';
import styles from './FlexPlans.module.less';

export const FlexPlans: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const flexPlans = useIndexerFlexPlans(BigNumber.from(id).toString());
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
          if (!flexPlans.length) return <EmptyList description={t('explorer.flexPlans.non')} />;
          return (
            <>
              <CreateHostingFlexPlan></CreateHostingFlexPlan>
              <Table columns={getColumns()} dataSource={flexPlans} rowKey={'id'} />
            </>
          );
        },
      })}
    </>
  );
};
