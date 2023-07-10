// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { BsStarFill } from 'react-icons/bs';
import { useParams } from 'react-router';
import { useNavigate } from 'react-router-dom';
import { BillingExchangeModal } from '@components/BillingTransferModal';
import { TableTitle, Typography } from '@subql/components';
import { useGetConsumerOngoingFlexPlansQuery } from '@subql/react-hooks';
import { Button, Divider, Space, Table, TableProps } from 'antd';
import { BigNumber } from 'ethers';
import i18next from 'i18next';
import moment from 'moment';

import { AppTypography, EmptyList, Spinner, TableText } from '../../../components';
import { ConnectedIndexer } from '../../../components/IndexerDetails/IndexerName';
import { useSQToken, useWeb3 } from '../../../containers';
import { IIndexerFlexPlan, useIndexerFlexPlans } from '../../../hooks';
import {
  formatEther,
  formatSecondsDuration,
  getFlexPlanPrice,
  mapAsync,
  mergeAsync,
  notEmpty,
  renderAsyncArray,
  ROUTES,
  TOKEN,
} from '../../../utils';
import styles from './FlexPlans.module.less';
import { PurchaseFlexPlan } from './PurchaseFlexPlan';

type Data<T> = T | undefined;

function checkIfPurchased(openPlans: Data<any>, plan: IIndexerFlexPlan): boolean | undefined {
  if (openPlans?.stateChannels?.nodes) {
    return openPlans.stateChannels?.nodes?.some(
      (openPlan: { indexer: string }) => openPlan?.indexer.toLowerCase() === plan.indexer,
    );
  }
}

// TODO: confirm score threadThread with consumer host service
const getColumns = (
  account: string | null | undefined,
  openPlans: Data<any>,
  balance: BigNumber | undefined,
  onFetchBalance: () => void,
): TableProps<IIndexerFlexPlan>['columns'] => [
  {
    dataIndex: 'indexer',
    title: <TableTitle>{i18next.t('explorer.flexPlans.indexer')}</TableTitle>,
    render: (indexer, indexerFlexPlans) => {
      return (
        <Space className="flex">
          <div className={styles.starContainer}>
            {indexerFlexPlans.score >= 150 && <BsStarFill className={styles.star} />}
          </div>
          <ConnectedIndexer id={indexer} />
        </Space>
      );
    },
  },
  {
    dataIndex: 'price',
    title: <TableTitle>{i18next.t('general.price')}</TableTitle>,
    render: (price) => <TableText content={getFlexPlanPrice(price)} />,
  },
  {
    dataIndex: 'max_time',
    title: <TableTitle>{i18next.t('flexPlans.validityPeriod')}</TableTitle>,
    render: (max) => <TableText>{formatSecondsDuration(max)}</TableText>,
  },
  // {
  //   dataIndex: 'indexer',
  //   title: <TableTitle>{i18next.t('general.action')}</TableTitle>,
  //   render: (indexer, plan) => {
  //     if (indexer.toLowerCase() === account?.toLowerCase()) {
  //       return <AppTypography type="secondary">{i18next.t('flexPlans.own')} </AppTypography>;
  //     }

  //     const isPurchased = checkIfPurchased(openPlans, plan);

  //     return (
  //       <PurchaseFlexPlan
  //         isPurchased={isPurchased ?? false}
  //         flexPlan={plan}
  //         balance={balance}
  //         onFetchBalance={onFetchBalance}
  //       />
  //     );
  //   },
  // },
];

export const FlexPlans: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { account } = useWeb3();
  const { id } = useParams<{ id: string }>();
  const { consumerHostBalance } = useSQToken();
  const flexPlans = useIndexerFlexPlans(BigNumber.from(id).toString());

  const [now] = React.useState<Date>(moment().toDate());
  const openPlans = useGetConsumerOngoingFlexPlansQuery({
    variables: {
      consumer: account ?? '',
      now,
    },
  });

  const [balance] = consumerHostBalance.data ?? [];
  const onFetchConsumerHostBalance = () => consumerHostBalance.refetch();

  React.useEffect(() => {
    if (!id) {
      navigate(ROUTES.EXPLORER);
    }
  }, [navigate, id]);
  return (
    <>
      {renderAsyncArray(
        mergeAsync(
          mapAsync((d) => d.filter(notEmpty), flexPlans),
          openPlans,
        ),
        {
          loading: () => <Spinner />,
          error: (e) => <AppTypography type="danger">{'Failed to load flex plan.'}</AppTypography>,
          empty: () => <EmptyList description={'explorer.flexPlans.non'} />,
          data: (data) => {
            const [flexPlans, openPlans] = data;
            return (
              <>
                {
                  <div className={styles.billingCard}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="text" type="secondary">
                          {t('flexPlans.billBalance').toUpperCase()}
                        </Typography>

                        <Typography variant="h6" style={{ marginTop: '12px' }}>
                          {`${formatEther(balance, 4)} ${TOKEN}`}
                        </Typography>
                      </div>
                      <Button type="primary" shape="round" size="large" className={styles.billingButton}>
                        {t('flexPlans.deposit')}
                        <div style={{ opacity: 0, position: 'absolute', left: 0, top: 0 }}>
                          <BillingExchangeModal action="Transfer" />
                        </div>
                      </Button>
                    </div>
                    <Divider style={{ margin: '16px 0' }}></Divider>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <img
                        src="/static/thumb.svg"
                        alt=""
                        style={{ alignSelf: 'flex-start', height: '100%', marginRight: 8 }}
                      ></img>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="text" weight={500}>
                          {t('flexPlans.flexPlan')}
                        </Typography>
                        <Typography variant="text" type="secondary">
                          {t('flexPlans.flexPlanDesc')}
                        </Typography>
                      </div>
                      <span style={{ flex: 1 }}></span>
                      <Button type="primary" shape="round" size="large" className={styles.billingButton}>
                        {t('flexPlans.createFlexPlan')}
                      </Button>
                    </div>
                  </div>
                }
                <Table
                  columns={getColumns(account, openPlans, balance, onFetchConsumerHostBalance)}
                  dataSource={flexPlans}
                  rowKey={'id'}
                />
              </>
            );
          },
        },
      )}
    </>
  );
};
