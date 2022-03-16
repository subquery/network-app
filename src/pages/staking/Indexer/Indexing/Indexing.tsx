// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Spinner, Typography } from '@subql/react-ui';
import { Table } from 'antd';
import * as React from 'react';
import styles from './Indexing.module.css';
import { useTranslation } from 'react-i18next';
import { OwnDelegator } from '../OwnDelegator';
import { DoStake } from '../DoStake';
import { SetCommissionRate } from '../SetCommissionRate';
import { mapEraValue, parseRawEraValue } from '../../../../hooks/useEraValue';
import { convertStringToNumber, formatEther, mapAsync, mergeAsync, renderAsync } from '../../../../utils';
import { useIndexerCapacity, useIsIndexer, useSortedIndexer } from '../../../../hooks';
import { useEra, useIndexerDelegators } from '../../../../containers';
import { BsArrowReturnRight } from 'react-icons/bs';

enum SectionTabs {
  Projects = 'Projects',
  Delegator = 'Delegator',
}

const CurAndNextData = ({ item, unit }: any) => {
  return (
    <div>
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

export const NotRegisteredIndexer: React.VFC = () => {
  const { t } = useTranslation();
  return (
    <>
      <Typography>{t('indexer.notRegister')}</Typography>
      <div className={styles.learnMoreContainer}>
        <Typography className={styles.learnMoreText}>{t('indexer.learnMore')}</Typography>
        <a href="https://doc.subquery.network/" target="blank" className={styles.learnMoreBtn}>
          {t('indexer.here')}
        </a>
      </div>
    </>
  );
};

interface Props {
  tableData: ReturnType<typeof useSortedIndexer>;
  indexer: string;
}

export const Indexing: React.VFC<Props> = ({ tableData, indexer }) => {
  const [curTab, setCurTab] = React.useState<SectionTabs>(SectionTabs.Delegator);
  const { t } = useTranslation();
  const isIndexer = useIsIndexer(indexer);
  const curCapacity = useIndexerCapacity(indexer || '');

  const columns = [
    {
      title: t('indexer.totalStake').toLocaleUpperCase(),
      dataIndex: 'totalStake',
      key: 'totalStake',
      render: (item: any) => <CurAndNextData item={item} unit={'SQT'} />,
    },
    {
      title: t('indexer.ownStake').toLocaleUpperCase(),
      dataIndex: 'ownStake',
      key: 'ownStake',
      render: (item: any) => <CurAndNextData item={item} unit={'SQT'} />,
    },
    {
      title: t('indexer.commission').toLocaleUpperCase(),
      dataIndex: 'commission',
      key: 'commission',
      render: (item: any) => <CurAndNextData item={item} />,
    },
    {
      title: t('indexer.delegated').toLocaleUpperCase(),
      dataIndex: 'totalDelegations',
      key: 'delegated',
      render: (item: any) => <CurAndNextData item={item} unit={'SQT'} />,
    },
    {
      title: t('indexer.capacity').toLocaleUpperCase(),
      dataIndex: 'capacity',
      key: 'capacity',
      render: (item: any) => <CurAndNextData item={item} unit={'SQT'} />,
    },
  ];

  const tabList = [SectionTabs.Projects, SectionTabs.Delegator];

  return (
    <div className={styles.indexing}>
      <div>
        {renderAsync(mergeAsync(isIndexer, tableData, curCapacity), {
          loading: () => <Spinner />,
          error: (e) => <Typography>{`Failed to load indexer information: ${e}`}</Typography>,
          data: (data) => {
            if (!data) return <></>;
            const [isIndexer, sortedIndexing, curCapacity] = data;
            console.log('sortedIndexing', sortedIndexing);
            if (!isIndexer) return <NotRegisteredIndexer />;
            if (!sortedIndexing)
              return (
                <>
                  <Typography className={styles.grayText}>{t('indexer.doStake')}</Typography>
                  <div className={styles.btns}>
                    <DoStake />
                  </div>
                </>
              );
            return (
              <>
                <div>
                  <Typography className={styles.grayText}>{t('indexer.topRowData')}</Typography>
                  <Typography className={styles.grayText}>
                    <BsArrowReturnRight className={styles.nextIcon} />
                    {t('indexer.secondRowData')}
                  </Typography>
                </div>

                <div className={styles.btns}>
                  <DoStake />
                  <SetCommissionRate />
                </div>
                <Table
                  columns={columns}
                  dataSource={[
                    {
                      ...sortedIndexing,
                      capacity: { current: formatEther(curCapacity?._hex) },
                    },
                  ]}
                  pagination={false}
                />
                {/* TODO Button component */}
                <div>
                  <div className={styles.tabList}>
                    {tabList.map((tab) => (
                      <div key={tab} className={styles.tab} onClick={() => setCurTab(tab)}>
                        <Typography className={`${styles.tabText} ${styles.grayText}`}>{tab}</Typography>
                        {curTab === tab && <div className={styles.line} />}
                      </div>
                    ))}
                  </div>

                  {curTab === SectionTabs.Projects && <div>Projects</div>}
                  {curTab === SectionTabs.Delegator && <OwnDelegator indexer={indexer} />}
                </div>
              </>
            );
          },
        })}
      </div>
    </div>
  );
};
