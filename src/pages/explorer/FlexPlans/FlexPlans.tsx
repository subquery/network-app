// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { BigNumber } from 'ethers';
import { useParams } from 'react-router';
import { useNavigate } from 'react-router-dom';
import { Space, Table, TableProps } from 'antd';
import i18next from 'i18next';
import { BsStarFill } from 'react-icons/bs';
import { useIndexerFlexPlans, IIndexerFlexPlan } from '../../../hooks';
import { AppTypography, EmptyList, Spinner, TableText } from '../../../components';
import { TableTitle } from '../../../components/TableTitle';
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
import { ConnectedIndexer } from '../../../components/IndexerDetails/IndexerName';
import styles from './FlexPlans.module.css';
import { useConsumerOpenFlexPlans, useSQToken, useWeb3 } from '../../../containers';
import { useTranslation } from 'react-i18next';
import { PurchaseFlexPlan } from './PurchaseFlexPlan';
import { GetOngoingFlexPlan } from '../../../__generated__/registry/GetOngoingFlexPlan';
import moment from 'moment';

type Data<T> = T | undefined;

function checkIfPurchased(openPlans: Data<GetOngoingFlexPlan>, plan: IIndexerFlexPlan): boolean | undefined {
  if (openPlans?.stateChannels?.nodes) {
    return openPlans.stateChannels?.nodes.some((openPlan) => openPlan?.indexer.toLowerCase() === plan.indexer);
  }
}

// TODO: confirm score threadThread with consumer host service
const getColumns = (
  account: string | null | undefined,
  openPlans: Data<GetOngoingFlexPlan>,
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
  {
    dataIndex: 'indexer',
    title: <TableTitle>{i18next.t('general.action')}</TableTitle>,
    render: (indexer, plan) => {
      if (indexer.toLowerCase() === account?.toLowerCase()) {
        return <AppTypography type="secondary">{i18next.t('flexPlans.own')} </AppTypography>;
      }

      const isPurchased = checkIfPurchased(openPlans, plan);

      return (
        <PurchaseFlexPlan
          isPurchased={isPurchased ?? false}
          flexPlan={plan}
          balance={balance}
          onFetchBalance={onFetchBalance}
        />
      );
    },
  },
];

export const FlexPlans: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { account } = useWeb3();
  const { id } = useParams<{ id: string }>();
  const { consumerHostBalance } = useSQToken();
  const flexPlans = useIndexerFlexPlans(BigNumber.from(id).toString());

  const [now] = React.useState<Date>(moment().toDate());
  const openPlans = useConsumerOpenFlexPlans({ consumer: account ?? '', now });

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
                {balance && (
                  <AppTypography tooltip={t('flexPlans.billingAccountTooltip')} className={styles.billBalance}>
                    {t('flexPlans.billingAccount', { amount: `${formatEther(balance, 4)} ${TOKEN}` })}
                  </AppTypography>
                )}
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
