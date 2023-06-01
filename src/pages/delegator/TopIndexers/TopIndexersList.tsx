// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { GetTopIndexers_indexerPrograms } from '@__generated__/excellentIndexers/GetTopIndexers'; // TODO: add excellentIndexers to network-query codegen
import { AntDTable, SearchInput, TableText } from '@components';
import { ConnectedIndexer } from '@components/IndexerDetails/IndexerName';
import { useWeb3 } from '@containers';
import { Typography } from '@subql/components';
import { TableTitle } from '@subql/components';
import { getOrderedAccounts, mulToPercentage, ROUTES } from '@utils';
import { TableProps, Tag } from 'antd';
import i18next from 'i18next';
import { FixedType } from 'rc-table/lib/interface';

import { DoDelegate } from '../DoDelegate';
import styles from './TopIndexersList.module.css';
const { DELEGATOR, INDEXER } = ROUTES;

const getColumns = (
  account: string,
  viewIndexerDetail: (url: string) => void,
): TableProps<GetTopIndexers_indexerPrograms>['columns'] => [
  {
    title: <TableTitle title={'#'} />,
    dataIndex: 'idx',
    width: 50,
    render: (_: string, __: any, index: number) => <TableText>{index + 1}</TableText>,
    onCell: (record: GetTopIndexers_indexerPrograms) => ({
      onClick: () => viewIndexerDetail(record.id),
    }),
  },
  {
    title: <TableTitle title={i18next.t('indexer.title')} />,
    dataIndex: 'id',
    width: 250,
    render: (val) => <ConnectedIndexer id={val} account={account} />,
  },
  {
    title: <TableTitle tooltip={i18next.t('topIndexers.tooltip.rank')} title={i18next.t('topIndexers.score')} />,
    dataIndex: 'totalPoints',
    render: (ranking) => <TableText>{ranking.toFixed(2)}</TableText>,
    onCell: () => ({
      onClick: () => viewIndexerDetail(account),
    }),
    sorter: (a, b) => a.totalPoints - b.totalPoints,
    showSorterTooltip: false,
  },
  {
    title: <TableTitle tooltip={i18next.t('topIndexers.tooltip.uptime')} title={i18next.t('topIndexers.uptime')} />,
    dataIndex: 'uptime',
    render: (upTime) => <TableText>{mulToPercentage(upTime)}</TableText>,
    onCell: (record: GetTopIndexers_indexerPrograms) => ({
      onClick: () => viewIndexerDetail(record.id),
    }),
    sorter: (a, b) => a.uptime - b.uptime,
    showSorterTooltip: false,
  },
  {
    title: <TableTitle tooltip={i18next.t('topIndexers.tooltip.ownStake')} title={i18next.t('topIndexers.ownStake')} />,
    dataIndex: 'ownStaked',
    render: (ownStake) => <TableText>{mulToPercentage(ownStake)}</TableText>,
    onCell: (record: GetTopIndexers_indexerPrograms) => ({
      onClick: () => viewIndexerDetail(record.id),
    }),
    sorter: (a, b) => a.ownStaked - b.ownStaked,
    showSorterTooltip: false,
  },
  {
    title: (
      <TableTitle tooltip={i18next.t('topIndexers.tooltip.delegated')} title={i18next.t('topIndexers.delegated')} />
    ),
    dataIndex: 'delegated',
    render: (delegated) => <TableText>{mulToPercentage(delegated)}</TableText>,
    onCell: (record: GetTopIndexers_indexerPrograms) => ({
      onClick: () => viewIndexerDetail(record.id),
    }),
    sorter: (a, b) => a.delegated - b.delegated,
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
    render: (eraRewardsCollection) => (
      <TableText>{i18next.t(eraRewardsCollection === 1 ? 'general.frequent' : 'general.infrequent')}</TableText>
    ),
    onCell: (record: GetTopIndexers_indexerPrograms) => ({
      onClick: () => viewIndexerDetail(record.id),
    }),
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
  // {
  //   title: (
  //     <TableTitle
  //       noTooltipIcon={true}
  //       tooltip={i18next.t('topIndexers.tooltip.timeToUpgrade')}
  //       title={i18next.t('topIndexers.timeToUpgrade')}
  //     />
  //   ),
  //   dataIndex: 'timeToUpgrade',
  //   render: (timeToUpgrade) => <TableText>{timeToUpgrade}</TableText>,
  // },
  {
    title: <TableTitle tooltip={i18next.t('topIndexers.tooltip.ssl')} title={i18next.t('topIndexers.ssl')} />,
    dataIndex: 'sslEnabled',
    render: (enableSSL) => {
      if (enableSSL) {
        return <Tag color="green">{i18next.t('general.enabled')}</Tag>;
      }
      return <Tag>{i18next.t('general.disabled')}</Tag>;
    },
    onCell: (record: GetTopIndexers_indexerPrograms) => ({
      onClick: () => viewIndexerDetail(record.id),
    }),
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
    dataIndex: 'socialCredibility',
    render: (socialCredibility) => {
      if (socialCredibility) {
        return <Tag color="green">{i18next.t('general.enabled')}</Tag>;
      }
      return <Tag>{i18next.t('general.disabled')}</Tag>;
    },
    onCell: (record: GetTopIndexers_indexerPrograms) => ({
      onClick: () => viewIndexerDetail(record.id),
    }),
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
  {
    title: <TableTitle title={i18next.t('indexer.action')} />,
    dataIndex: 'id',
    align: 'center',
    fixed: 'right' as FixedType,
    render: (id: string) => {
      if (id === account) return <Typography> - </Typography>;
      return <DoDelegate indexerAddress={id} variant="textBtn" />;
    },
  },
];

interface props {
  indexers: GetTopIndexers_indexerPrograms[];
  onLoadMore?: (offset: number) => void;
}

export const TopIndexerList: React.FC<props> = ({ indexers, onLoadMore }) => {
  const { account } = useWeb3();
  const navigate = useNavigate();
  const viewIndexerDetail = (id: string) => navigate(`/${DELEGATOR}/${INDEXER}/${id}`);

  const orderedIndexerList = getOrderedAccounts(indexers.slice(), 'id', account);

  const SearchAddress = () => (
    <div className={styles.indexerSearch}>
      <SearchInput
        onSearch={(value: string) => {
          console.log(`search value ${value}`);
        }}
        // defaultValue={searchIndexer}
        // loading={sortedIndexer.loading}
        // emptyResult={!searchedIndexer}
      />
    </div>
  );

  const columns = getColumns(account ?? '', viewIndexerDetail);

  return (
    <div className={styles.container}>
      <div className={styles.indexerListHeader}>
        <SearchAddress />
      </div>

      <AntDTable
        customPagination
        tableProps={{ columns, rowKey: 'id', scroll: { x: 1600 }, dataSource: [...orderedIndexerList] }}
        // paginationProps={{
        //   total: searchedIndexer ? searchedIndexer.length : totalCount,
        //   onChange: (page, pageSize) => {
        //     onLoadMore?.((page - 1) * pageSize);
        //   },
        // }}
      />
    </div>
  );
};
