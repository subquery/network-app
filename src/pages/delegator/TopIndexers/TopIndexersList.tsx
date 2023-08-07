// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { AntDTable, SearchInput, TableText } from '@components';
import { ConnectedIndexer } from '@components/IndexerDetails/IndexerName';
import { useWeb3 } from '@containers';
import { Spinner, Typography } from '@subql/components';
import { TableTitle } from '@subql/components';
import { DelegationFieldsFragment, GetTopIndexersQuery, IndexerFieldsFragment } from '@subql/network-query';
import { useGetAllDelegationsQuery, useGetIndexersQuery } from '@subql/react-hooks';
import { getOrderedAccounts, mulToPercentage, ROUTES, truncateToDecimalPlace } from '@utils';
import { TableProps, Tag } from 'antd';
import i18next from 'i18next';
import { FixedType } from 'rc-table/lib/interface';

import { DoDelegate } from '../DoDelegate';
import styles from './TopIndexersList.module.css';
const { DELEGATOR, INDEXER } = ROUTES;

const getColumns = (
  account: string,
  delegations: readonly (DelegationFieldsFragment | null)[],
  indexers: readonly (IndexerFieldsFragment | null)[],
): TableProps<GetTopIndexersQuery['indexerPrograms'][number]>['columns'] => [
  {
    title: <TableTitle title={'#'} />,
    dataIndex: 'idx',
    width: 50,
    render: (_: string, __: any, index: number) => <TableText>{index + 1}</TableText>,
  },
  {
    title: <TableTitle title={i18next.t('indexer.title')} />,
    dataIndex: 'id',
    width: 250,
    render: (val) => <ConnectedIndexer id={val} account={account} />,
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
      <div>
        {raw.nextICR === currICR ? (
          <span>{currICR}%</span>
        ) : (
          <span>
            <del>{currICR}%</del>
            {raw.nextICR}%
          </span>
        )}
      </div>
    ),
  },
  {
    title: <TableTitle tooltip={i18next.t('topIndexers.tooltip.rank')} title={i18next.t('topIndexers.score')} />,
    dataIndex: 'totalPoints',
    render: (ranking) => <TableText>{ranking.toFixed(2)}</TableText>,

    sorter: (a, b) => a.totalPoints - b.totalPoints,
    showSorterTooltip: false,
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
    render: (ownStake) => <TableText>{mulToPercentage(ownStake)}</TableText>,

    sorter: (a, b) => a.ownStaked - b.ownStaked,
    showSorterTooltip: false,
  },
  {
    title: (
      <TableTitle tooltip={i18next.t('topIndexers.tooltip.delegated')} title={i18next.t('topIndexers.delegated')} />
    ),
    dataIndex: 'delegated',
    render: (delegated) => <TableText>{mulToPercentage(delegated)}</TableText>,

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
  {
    title: <TableTitle title={i18next.t('indexer.action')} />,
    dataIndex: 'id',
    align: 'center',
    fixed: 'right' as FixedType,
    render: (id: string) => {
      if (id === account) return <Typography> - </Typography>;
      const delegation = delegations.find((i) => i?.id === `${account}:${id}`);
      const indexer = indexers.find((i) => i?.id === id);
      return (
        <div
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <DoDelegate indexerAddress={id} variant="textBtn" delegation={delegation} indexer={indexer} />
        </div>
      );
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
  const viewIndexerDetail = (id: string) => navigate(`/${DELEGATOR}/${INDEXER}/${id}`);
  const [filterParams, setFilterParams] = React.useState<{ address: string }>({
    address: '',
  });

  // TODO: add filter into network-query
  const delegations = useGetAllDelegationsQuery();
  const allIndexers = useGetIndexersQuery({
    variables: {
      filter: { id: { in: indexers.map((i) => i.id) } },
    },
  });

  // better sort in graphql but now cannot.
  const orderedIndexerList = React.useMemo(() => {
    return getOrderedAccounts(
      indexers.slice().sort((a, b) => b.totalPoints - a.totalPoints),
      'id',
      account,
    ).filter((i) => i.id.includes(filterParams.address));
  }, [indexers, account, filterParams]);

  const SearchAddress = () => (
    <div className={styles.indexerSearch}>
      <SearchInput
        defaultValue={filterParams.address}
        onSearch={(value: string) => {
          setFilterParams({
            ...filterParams,
            address: value,
          });
        }}
      />
    </div>
  );

  const columns = React.useMemo(() => {
    if (delegations.data?.delegations?.nodes && allIndexers.data?.indexers?.nodes) {
      return getColumns(account ?? '', delegations.data.delegations.nodes, allIndexers.data.indexers.nodes);
    }

    return [];
  }, [account, viewIndexerDetail, delegations, allIndexers]);

  return (
    <div className={styles.container}>
      <div className={styles.indexerListHeader}>
        <SearchAddress />
      </div>

      {columns?.length ? (
        <AntDTable
          customPagination
          tableProps={{
            columns,
            rowKey: 'id',
            scroll: { x: 1600 },
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
