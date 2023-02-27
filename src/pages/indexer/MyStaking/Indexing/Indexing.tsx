// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Table, Typography } from 'antd';
import { BsArrowReturnRight } from 'react-icons/bs';
import { BigNumber } from 'ethers';
import clsx from 'clsx';
import styles from './Indexing.module.css';
import { isUndefined, TOKEN, truncFormatEtherStr } from '../../../../utils';
import { CurrentEraValue } from '../../../../hooks/useEraValue';
import { TableTitle } from '../../../../components/TableTitle';
import { UseSortedIndexerReturn } from '../../../../hooks/useSortedIndexer';
import { EmptyList } from '../../../../components';

export const NotRegisteredIndexer: React.VFC = () => {
  const { t } = useTranslation();

  return (
    <EmptyList
      title={t('indexer.notRegister')}
      description={[t('indexer.notRegisterDesc1'), t('indexer.notRegisterDesc2')]}
      infoI18nKey={'indexer.learnMore'}
      infoLinkDesc={t('general.learnMore')}
      infoLink="https://doc.subquery.network/"
    ></EmptyList>
  );
};

const CurAndNextData = ({ item, unit }: { item: CurrentEraValue; unit?: string }) => {
  const getSortedValue = (val: BigNumber | undefined) =>
    isUndefined(val) ? '-' : `${truncFormatEtherStr(val?.toString() ?? '')} ${unit || ''}`;
  return (
    <div key={item?.current.toString()}>
      <Typography.Text>{getSortedValue(item?.current)}</Typography.Text>
      <div className={clsx(styles.nextItem, styles.grayText)}>
        <div className={styles.nextIcon}>
          <BsArrowReturnRight />
        </div>
        <Typography.Text className={styles.grayText}>{getSortedValue(item?.after)}</Typography.Text>
      </div>
    </div>
  );
};

interface Props {
  tableData: UseSortedIndexerReturn | undefined;
  showDelegated?: boolean;
}

export const Indexing: React.VFC<Props> = ({ tableData, showDelegated = false }) => {
  const { t } = useTranslation();

  const delegatedColumn = {
    title: <TableTitle title={'delegated'} />,
    dataIndex: 'totalDelegations',
    key: 'delegated',
    render: (item: CurrentEraValue) => <CurAndNextData item={item} unit={TOKEN} />,
  };

  const columns = [
    {
      title: <TableTitle title={t('indexer.totalStake')} />,
      dataIndex: 'totalStake',
      key: 'totalStake',
      render: (item: CurrentEraValue) => <CurAndNextData item={item} unit={TOKEN} />,
    },
    {
      title: <TableTitle title={t('indexer.ownStake')} />,
      dataIndex: 'ownStake',
      key: 'ownStake',
      render: (item: CurrentEraValue) => <CurAndNextData item={item} unit={TOKEN} />,
    },
    {
      title: <TableTitle title={t('indexer.commission')} />,
      dataIndex: 'commission',
      key: 'commission',
      render: (item: CurrentEraValue) => <CurAndNextData item={item} unit={'%'} />,
    },
    {
      title: <TableTitle title={t('indexer.capacity')} />,
      dataIndex: 'capacity',
      key: 'capacity',
      render: (item: CurrentEraValue) => <CurAndNextData item={item} unit={TOKEN} />,
    },
  ];

  if (showDelegated) {
    columns.push(delegatedColumn);
  }

  const sortedIndexingData = [tableData].map((indexer, idx) => ({ ...indexer, idx }));

  return (
    <>
      <Table columns={columns} dataSource={sortedIndexingData} pagination={false} rowKey={'idx'} />

      <div className={styles.textGroup}>
        <Typography.Text className={styles.grayText}>{t('indexer.topRowData')}</Typography.Text>
        <Typography.Text className={styles.grayText}>
          <Trans
            i18nKey={'indexer.secondRowData'}
            components={{ returnRightIcon: <BsArrowReturnRight className={styles.nextIcon} /> }}
          />
        </Typography.Text>
      </div>
    </>
  );
};
