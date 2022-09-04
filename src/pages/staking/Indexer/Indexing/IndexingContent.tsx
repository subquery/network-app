// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Typography } from '@subql/react-ui';
import { Table } from 'antd';
import * as React from 'react';
import styles from './Indexing.module.css';
import { useTranslation, Trans } from 'react-i18next';
import { OwnDelegator } from '../OwnDelegator';
import { DoStake } from '../DoStake';
import { SetCommissionRate } from '../SetCommissionRate';
import { BsArrowReturnRight } from 'react-icons/bs';
import { UseSortedIndexerReturn } from '../../../../hooks/useSortedIndexer';
import { useWeb3 } from '../../../../containers';
import { OwnDeployments } from '../OwnDeployments';
import { CurrentEraValue } from '../../../../hooks/useEraValue';
import { TOKEN } from '../../../../utils';

enum SectionTabs {
  Projects = 'Projects',
  Delegator = 'Delegators',
}

const CurAndNextData = ({ item, unit }: { item: CurrentEraValue; unit?: string }) => {
  return (
    <div key={item.current.toString()}>
      <Typography>{item?.current !== undefined ? `${item.current} ${unit || ''}` : '-'}</Typography>
      <div className={styles.nextItem}>
        <div className={styles.nextIcon}>
          <BsArrowReturnRight />
        </div>
        <Typography className={styles.nextValue} variant="medium">
          {item?.after !== undefined ? `${item.after} ${unit || ''}` : '-'}
        </Typography>
      </div>
    </div>
  );
};

interface Props {
  tableData: Array<UseSortedIndexerReturn>;
  indexer: string;
}

export const IndexingContent: React.VFC<Props> = ({ tableData, indexer }) => {
  const [curTab, setCurTab] = React.useState<SectionTabs>(SectionTabs.Projects);
  const { t } = useTranslation();
  const { account } = useWeb3();
  const sortedTableData = tableData.map((indexer, idx) => ({ ...indexer, idx }));

  const columns = [
    {
      title: t('indexer.totalStake').toLocaleUpperCase(),
      dataIndex: 'totalStake',
      key: 'totalStake',
      render: (item: CurrentEraValue) => <CurAndNextData item={item} unit={TOKEN} />,
    },
    {
      title: t('indexer.ownStake').toLocaleUpperCase(),
      dataIndex: 'ownStake',
      key: 'ownStake',
      render: (item: CurrentEraValue) => <CurAndNextData item={item} unit={TOKEN} />,
    },
    {
      title: t('indexer.delegated').toLocaleUpperCase(),
      dataIndex: 'totalDelegations',
      key: 'delegated',
      render: (item: CurrentEraValue) => <CurAndNextData item={item} unit={TOKEN} />,
    },
    {
      title: t('indexer.commission').toLocaleUpperCase(),
      dataIndex: 'commission',
      key: 'commission',
      render: (item: CurrentEraValue) => <CurAndNextData item={item} />,
    },

    {
      title: t('indexer.capacity').toLocaleUpperCase(),
      dataIndex: 'capacity',
      key: 'capacity',
      render: (item: CurrentEraValue) => <CurAndNextData item={item} unit={TOKEN} />,
    },
  ];

  const tabList = [SectionTabs.Projects, SectionTabs.Delegator];

  return (
    <>
      <div className={styles.textGroup}>
        <Typography className={styles.grayText}>{t('indexer.topRowData')}</Typography>
        <Typography className={styles.grayText}>
          <Trans
            i18nKey={'indexer.secondRowData'}
            components={{ returnRightIcon: <BsArrowReturnRight className={styles.nextIcon} /> }}
          />
        </Typography>
      </div>

      {account === indexer && (
        <div className={styles.btns}>
          <DoStake stakeAmountNextEra={sortedTableData[0].ownStake.after} />
          <SetCommissionRate />
        </div>
      )}

      <Table columns={columns} dataSource={sortedTableData} pagination={false} rowKey={'idx'} />

      <div>
        <div className={styles.tabList}>
          {tabList.map((tab) => (
            <div key={tab} className={styles.tab} onClick={() => setCurTab(tab)}>
              <Typography className={`${styles.tabText} ${styles.grayText}`}>{tab}</Typography>
              {curTab === tab && <div className={styles.line} />}
            </div>
          ))}
        </div>

        {curTab === SectionTabs.Projects && <OwnDeployments indexer={indexer} />}
        {curTab === SectionTabs.Delegator && <OwnDelegator indexer={indexer} />}
      </div>
    </>
  );
};
