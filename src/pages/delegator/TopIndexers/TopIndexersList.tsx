// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { AntDTable, APYTooltip, TableText } from '@components';
import { EstimatedNextEraLayout } from '@components/EstimatedNextEraLayout';
import { ConnectedIndexer } from '@components/IndexerDetails/IndexerName';
import { useWeb3 } from '@containers';
import { useMinCommissionRate } from '@hooks/useMinCommissionRate';
import { Spinner, Typography } from '@subql/components';
import { TableTitle } from '@subql/components';
import { GetTopIndexersQuery } from '@subql/network-query';
import { formatEther, useGetAllIndexerByApyQuery, useGetIndexersQuery } from '@subql/react-hooks';
import { getOrderedAccounts, mulToPercentage, ROUTES, truncateToDecimalPlace } from '@utils';
import { TableProps, Tag } from 'antd';
import BigNumber from 'bignumber.js';
import i18next from 'i18next';

import styles from './TopIndexersList.module.css';
const { INDEXER } = ROUTES;

const getColumns = (
  account: string,
): TableProps<GetTopIndexersQuery['indexerPrograms'][number] & { indexerApy: string; apyEra: number }>['columns'] => [
  {
    title: <TableTitle title={'#'} />,
    dataIndex: 'idx',
    width: 50,
    render: (_: string, __: unknown, index: number) => <TableText>{index + 1}</TableText>,
  },
  {
    title: <TableTitle title={'Node operators'} />,
    dataIndex: 'id',
    width: 250,
    render: (val) => <ConnectedIndexer id={val} account={account} />,
  },
  {
    title: (
      <Typography
        weight={600}
        variant="small"
        type="secondary"
        className="flex-center"
        style={{ textTransform: 'uppercase' }}
      >
        Estimated APY
        <APYTooltip currentEra={undefined} calculationDescsription={undefined} />
      </Typography>
    ),
    key: 'indexerApy',
    dataIndex: 'indexerApy',
    width: 300,
    render: (value: string) => {
      return <Typography>{BigNumber(formatEther(value)).multipliedBy(100).toFixed(2)} %</Typography>;
    },
    sorter: (a, b) => (BigNumber(a.indexerApy).minus(b.indexerApy).lte(0) ? -1 : 1),
  },
  {
    title: (
      <TableTitle
        title={i18next.t('topIndexers.commission')}
        tooltip={i18next.t('topIndexers.commissionTooltip')}
      ></TableTitle>
    ),
    dataIndex: 'currICR',
    sorter: (a, b) => a.nextICR - b.nextICR,
    render: (currICR, raw) => (
      <div className="col-flex">
        <Typography>
          <span>{currICR}%</span>
        </Typography>
        <div>
          <EstimatedNextEraLayout value={`${raw.nextICR}%`}></EstimatedNextEraLayout>
        </div>
      </div>
    ),
  },
  {
    title: <TableTitle tooltip={i18next.t('topIndexers.tooltip.uptime')} title={i18next.t('topIndexers.uptime')} />,
    dataIndex: 'uptime',
    render: (upTime) => <TableText>{truncateToDecimalPlace(upTime, 2)}%</TableText>,

    sorter: (a, b) => a.uptime - b.uptime,
    showSorterTooltip: false,
  },
  {
    title: <TableTitle tooltip={i18next.t('topIndexers.tooltip.ownStake')} title={i18next.t('topIndexers.ownStake')} />,
    dataIndex: 'ownStaked',
    width: 150,
    render: (ownStake) => <TableText>{mulToPercentage(ownStake)}</TableText>,

    sorter: (a, b) => a.ownStaked - b.ownStaked,
    showSorterTooltip: false,
  },
  {
    title: (
      <TableTitle
        tooltip={i18next.t('topIndexers.tooltip.eraRewardsCollection')}
        title={i18next.t('topIndexers.eraRewardsCollection')}
      />
    ),
    dataIndex: 'rewardCollection',
    width: 220,
    render: (eraRewardsCollection) => (
      <TableText>{i18next.t(eraRewardsCollection === 1 ? 'general.frequent' : 'general.infrequent')}</TableText>
    ),

    filters: [
      {
        text: i18next.t('general.frequent'),
        value: 1,
      },
      {
        text: i18next.t('general.infrequent'),
        value: 0,
      },
    ],
    onFilter: (value, record) => {
      if (value === 1) return record.rewardCollection >= value;
      return record.rewardCollection < 1;
    },
  },
  {
    title: <TableTitle tooltip={i18next.t('topIndexers.tooltip.ssl')} title={i18next.t('topIndexers.ssl')} />,
    dataIndex: 'sslEnabled',
    width: 100,
    render: (enableSSL) => {
      if (enableSSL) {
        return <Tag color="green">{i18next.t('general.enabled')}</Tag>;
      }
      return <Tag>{i18next.t('general.disabled')}</Tag>;
    },

    filters: [
      {
        text: i18next.t('general.enabled'),
        value: true,
      },
      {
        text: i18next.t('general.disabled'),
        value: false,
      },
    ],
    onFilter: (value, record) => {
      if (value) return record.sslEnabled;
      return !record.sslEnabled;
    },
  },
  {
    title: (
      <TableTitle
        tooltip={i18next.t('topIndexers.tooltip.socialCredibility')}
        title={i18next.t('topIndexers.socialCredibility')}
      />
    ),
    width: 200,
    dataIndex: 'socialCredibility',
    render: (socialCredibility) => {
      if (socialCredibility) {
        return <Tag color="green">{i18next.t('general.enabled')}</Tag>;
      }
      return <Tag>{i18next.t('general.disabled')}</Tag>;
    },

    filters: [
      {
        text: i18next.t('general.enabled'),
        value: true,
      },
      {
        text: i18next.t('general.disabled'),
        value: false,
      },
    ],
    onFilter: (value, record) => {
      if (value) return record.socialCredibility;
      return !record.socialCredibility;
    },
  },
];

interface props {
  indexers: GetTopIndexersQuery['indexerPrograms'];
  onLoadMore?: (offset: number) => void;
}

export const TopIndexerList: React.FC<props> = ({ indexers, onLoadMore }) => {
  const { account } = useWeb3();
  const navigate = useNavigate();
  const viewIndexerDetail = (id: string) => {
    navigate(`/${INDEXER}/${id}`);
  };

  const { getDisplayedCommission } = useMinCommissionRate();

  const allIndexers = useGetIndexersQuery({
    variables: {
      filter: { id: { in: indexers.map((i) => i.id) } },
    },
  });

  const allIndexerApys = useGetAllIndexerByApyQuery({
    variables: {
      first: 100,
      filter: {
        indexerId: { in: indexers.map((i) => i.id) },
      },
    },
  });

  // better sort in graphql but now cannot.
  const orderedIndexerList = React.useMemo(() => {
    const ordered = getOrderedAccounts(
      indexers.slice().sort((a, b) => b.totalPoints - a.totalPoints),
      'id',
      account,
    );

    return ordered.map((topIndex) => {
      const find = allIndexers.data?.indexers?.nodes.find((i) => i?.id === topIndex.id);
      if (!find) return topIndex;
      const findApy = allIndexerApys.data?.indexerApySummaries?.nodes.find((i) => i?.indexerId === topIndex.id);

      const ownStakedAmount = BigNumber(find.indexerStakes.nodes?.[0]?.indexerStake.toString() || '0');
      const totalStakedAmount = BigNumber(find.totalStake.valueAfter.value);
      const ownStaked = ownStakedAmount.div(totalStakedAmount).toNumber();
      return {
        ...topIndex,
        ownStaked,
        currICR: getDisplayedCommission(topIndex.currICR),
        nextICR: getDisplayedCommission(topIndex.nextICR),
        indexerApy: findApy?.indexerApy || 0,
        apyEra: findApy?.eraIdx || 0,
      };
    });
  }, [indexers, account, allIndexerApys, allIndexers, getDisplayedCommission]);

  const columns = React.useMemo(() => {
    return getColumns(account ?? '');
  }, [account]);

  return (
    <div className={styles.container}>
      {columns?.length ? (
        <AntDTable
          customPagination
          tableProps={{
            columns,
            rowKey: 'id',
            dataSource: orderedIndexerList,
            onRow: (record) => ({
              onClick: () => {
                viewIndexerDetail(record.id);
              },
            }),
          }}
        />
      ) : (
        <Spinner></Spinner>
      )}
    </div>
  );
};
