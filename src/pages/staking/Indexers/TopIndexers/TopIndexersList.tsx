// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Typography } from '@subql/react-ui';
import { TableProps } from 'antd';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import { AntDTable, SearchInput, TableText } from '../../../../components';
import { ConnectedIndexer } from '../../../../components/IndexerDetails/IndexerName';

import { DoDelegate } from '../DoDelegate';
import { TableTitle } from '../../../../components/TableTitle';
import { useWeb3 } from '../../../../containers';
import styles from './TopIndexersList.module.css';
import { GetTopIndexers_indexerPrograms } from '../../../../__generated__/excellentIndexers/GetTopIndexers';

const getColumns = (account: string): TableProps<GetTopIndexers_indexerPrograms>['columns'] => [
  {
    title: '#',
    dataIndex: 'idx',
    width: 20,
    render: (_: string, __: any, index: number) => <TableText>{index + 1}</TableText>,
  },
  {
    title: <TableTitle title={i18next.t('indexer.title')} />,
    dataIndex: 'id',
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
    dataIndex: 'totalPoints',
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
    dataIndex: 'uptime',
    render: (upTime) => <TableText>{`${upTime * 100} %`}</TableText>,
  },
  {
    title: (
      <TableTitle
        noTooltipIcon={true}
        tooltip={i18next.t('topIndexers.tooltip.ownStake')}
        title={i18next.t('topIndexers.ownStake')}
      />
    ),
    dataIndex: 'ownStaked',
    render: (ownStake) => <TableText>{`${ownStake * 100} %`}</TableText>,
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
    render: (delegated) => <TableText>{`${delegated * 100} %`}</TableText>,
  },
  {
    title: (
      <TableTitle
        noTooltipIcon={true}
        tooltip={i18next.t('topIndexers.tooltip.eraRewardsCollection')}
        title={i18next.t('topIndexers.eraRewardsCollection')}
      />
    ),
    dataIndex: 'rewardCollection',
    render: (eraRewardsCollection) => (
      <TableText>{i18next.t(eraRewardsCollection === 1 ? 'general.frequent' : 'general.infrequent')}</TableText>
    ),
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
    title: (
      <TableTitle
        noTooltipIcon={true}
        tooltip={i18next.t('topIndexers.tooltip.ssl')}
        title={i18next.t('topIndexers.ssl')}
      />
    ),
    dataIndex: 'sslEnabled',
    render: (enableSSL) => <TableText>{i18next.t(enableSSL ? 'general.enabled' : 'general.disabled')}</TableText>,
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
    render: (socialCredibility) => (
      <TableText>{i18next.t(socialCredibility ? 'general.enabled' : 'general.disabled')}</TableText>
    ),
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
  indexers: GetTopIndexers_indexerPrograms[];
  onLoadMore?: (offset: number) => void;
}

export const TopIndexerList: React.VFC<props> = ({ indexers, onLoadMore }) => {
  const { t } = useTranslation();
  const { account } = useWeb3();
  //   const history = useHistory();

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
        tableProps={{ columns, rowKey: 'id', dataSource: [...indexers] }}
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
