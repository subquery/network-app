// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Typography } from '@subql/react-ui';
import { TableProps } from 'antd';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import { ITopIndexers } from '../../../../containers/QueryTop100Indexers';
import { AntDTable, SearchInput, TableText } from '../../../../components';
import { ConnectedIndexer } from '../../../../components/IndexerDetails/IndexerName';
import { DoDelegate } from '../DoDelegate';
import { TableTitle } from '../../../../components/TableTitle';
import { useWeb3 } from '../../../../containers';
import styles from './TopIndexersList.module.css';

// : TableProps<ITopIndexers>['columns']
const getColumns = (account: string): TableProps<ITopIndexers>['columns'] => [
  {
    title: '#',
    dataIndex: 'idx',
    width: 20,
    render: (_: string, __: any, index: number) => <TableText>{index + 1}</TableText>,
  },
  {
    title: <TableTitle title={i18next.t('indexer.title')} />,
    dataIndex: 'indexer',
    render: (val) => <ConnectedIndexer id={val} account={account} />,
  },
  {
    title: (
      <TableTitle
        noTooltipIcon={true}
        tooltip={i18next.t('topIndexers.tooltip.rank')}
        title={i18next.t('topIndexers.rank')}
      />
    ),
    dataIndex: 'ranking',
    render: (ranking) => <TableText>{ranking}</TableText>,
  },
  {
    title: (
      <TableTitle
        noTooltipIcon={true}
        tooltip={i18next.t('topIndexers.tooltip.uptime')}
        title={i18next.t('topIndexers.uptime')}
      />
    ),
    dataIndex: 'upTime',
    render: (upTime) => <TableText>{upTime}</TableText>,
  },
  {
    title: (
      <TableTitle
        noTooltipIcon={true}
        tooltip={i18next.t('topIndexers.tooltip.ownStake')}
        title={i18next.t('topIndexers.ownStake')}
      />
    ),
    dataIndex: 'ownStake',
    render: (ownStake) => <TableText>{ownStake}</TableText>,
  },
  {
    title: (
      <TableTitle
        noTooltipIcon={true}
        tooltip={i18next.t('topIndexers.tooltip.delegated')}
        title={i18next.t('topIndexers.delegated')}
      />
    ),
    dataIndex: 'delegated',
    render: (delegated) => <TableText>{delegated}</TableText>,
  },
  {
    title: (
      <TableTitle
        noTooltipIcon={true}
        tooltip={i18next.t('topIndexers.tooltip.eraRewardsCollection')}
        title={i18next.t('topIndexers.eraRewardsCollection')}
      />
    ),
    dataIndex: 'eraRewardsCollection',
    render: (eraRewardsCollection) => <TableText>{eraRewardsCollection}</TableText>,
  },
  {
    title: (
      <TableTitle
        noTooltipIcon={true}
        tooltip={i18next.t('topIndexers.tooltip.timeToUpgrade')}
        title={i18next.t('topIndexers.timeToUpgrade')}
      />
    ),
    dataIndex: 'timeToUpgrade',
    render: (timeToUpgrade) => <TableText>{timeToUpgrade}</TableText>,
  },
  {
    title: (
      <TableTitle
        noTooltipIcon={true}
        tooltip={i18next.t('topIndexers.tooltip.ssl')}
        title={i18next.t('topIndexers.ssl')}
      />
    ),
    dataIndex: 'enableSSL',
    render: (enableSSL) => <TableText>{enableSSL}</TableText>,
  },
  {
    title: (
      <TableTitle
        noTooltipIcon={true}
        tooltip={i18next.t('topIndexers.tooltip.socialCredibility')}
        title={i18next.t('topIndexers.socialCredibility')}
      />
    ),
    dataIndex: 'socialCredibility',
    render: (socialCredibility) => <TableText>{socialCredibility}</TableText>,
  },
  {
    title: <TableTitle title={i18next.t('indexer.action')} />,
    dataIndex: 'indexer',
    render: (id: string) => {
      if (id === account) return <Typography> - </Typography>;
      return <DoDelegate indexerAddress={id} variant="textBtn" />;
    },
  },
];

interface props {
  indexers: ITopIndexers[];
  onLoadMore?: (offset: number) => void;
}

export const IndexerList: React.VFC<props> = ({ indexers, onLoadMore }) => {
  const { t } = useTranslation();
  const { account } = useWeb3();
  //   const history = useHistory();
  console.log('indexers', indexers);
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

  const columns = getColumns(account ?? '');

  return (
    <div className={styles.container}>
      <div className={styles.indexerListHeader}>
        <SearchAddress />
      </div>

      <AntDTable
        customPagination
        tableProps={{ columns, rowKey: 'indexer', dataSource: [...indexers], scroll: { x: 1600 } }}
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
