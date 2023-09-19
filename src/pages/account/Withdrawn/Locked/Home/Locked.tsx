// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { BsExclamationCircle } from 'react-icons/bs';
import InfoCircleOutlined from '@ant-design/icons/InfoCircleOutlined';
import { EmptyList } from '@components';
import { TokenAmount } from '@components/TokenAmount';
import TransactionModal from '@components/TransactionModal';
import { useWeb3 } from '@containers';
import { defaultLockPeriod, useLockPeriod } from '@hooks';
import { Spinner, Typography } from '@subql/components';
import { TableText, TableTitle } from '@subql/components';
import { WithdrawalFieldsFragment as Withdrawls, WithdrawalType } from '@subql/network-query';
import { useGetWithdrawlsLazyQuery } from '@subql/react-hooks';
import { WithdrawalStatus } from '@subql/react-hooks/dist/graphql';
import { formatEther, LOCK_STATUS, mapAsync, mergeAsync, notEmpty, renderAsyncArray } from '@utils';
import { Button, Table, TableProps, Tag } from 'antd';
import assert from 'assert';
import clsx from 'clsx';
import { BigNumber } from 'ethers';
import { t } from 'i18next';
import { capitalize } from 'lodash-es';
import moment from 'moment';

import { useWeb3Store } from 'src/stores';

import { DoWithdraw } from '../DoWithdraw';
import styles from './Locked.module.less';

interface SortedWithdrawals extends Withdrawls {
  idx: number;
  endAt: string;
  lockStatus: LOCK_STATUS;
}

const dateFormat = 'MMMM Do YY, h:mm:ss a';

const CancelUnbonding: React.FC<{ id: string; type: WithdrawalType; onSuccess?: () => void }> = ({
  id,
  type,
  onSuccess,
}) => {
  const { contracts } = useWeb3Store();
  const cancelUnbonding = () => {
    assert(contracts, 'Contracts not available');

    return contracts.stakingManager.cancelUnbonding(id);
  };

  return (
    <div>
      <TransactionModal
        text={{
          title: '',
          steps: [],
        }}
        actions={[{ label: capitalize(t('general.cancel')), key: 'claim' }]}
        variant={'textBtn'}
        onClick={cancelUnbonding}
        width="416px"
        className={styles.cancelModal}
        onSuccess={onSuccess}
        renderContent={(onSubmit, onCancel, isLoading, error) => {
          return (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <BsExclamationCircle color="var(--sq-info)" fontSize={22}></BsExclamationCircle>
                <Typography style={{ marginLeft: 16 }} variant="text">
                  {type === WithdrawalType.UNDELEGATION
                    ? t('general.cancelUndelegation')
                    : t('general.cancelUnstaking')}
                </Typography>
              </div>
              <Typography variant="medium" style={{ marginLeft: 38, marginBottom: 32, color: 'var(--sq--gray700)' }}>
                {type === WithdrawalType.UNDELEGATION
                  ? t('general.cancelUndelegationTips')
                  : t('general.cancelUnstakingTips')}
              </Typography>
              <div className="flex-end">
                <Button onClick={onCancel} loading={isLoading} shape="round">
                  {capitalize(t('general.cancel'))}
                </Button>
                <Button
                  onClick={onSubmit}
                  loading={isLoading}
                  shape="round"
                  style={{ marginLeft: '10px' }}
                  type="primary"
                >
                  {capitalize(t('general.confirm'))}
                </Button>
              </div>
            </div>
          );
        }}
      ></TransactionModal>
    </div>
  );
};

export const Locked: React.FC = () => {
  const { t } = useTranslation();
  const { account } = useWeb3();
  const filterParams = {
    delegator: account || '',
    status: WithdrawalStatus.ONGOING,
    offset: 0,
  };
  // TODO: refresh when do the withdrawl action.
  const [getWithdrawals, withdrawals] = useGetWithdrawlsLazyQuery({
    variables: filterParams,
    fetchPolicy: 'network-only',
  });
  const lockPeriod = useLockPeriod();

  const columns: TableProps<SortedWithdrawals>['columns'] = [
    {
      title: <TableTitle title={'#'} />,
      width: '10%',
      render: (t, r, index) => <TableText content={index + 1} />,
    },
    {
      title: <TableTitle title={t('withdrawals.amount')} />,
      dataIndex: 'amount',
      width: '25%',
      render: (value: string) => <TokenAmount value={formatEther(value)} />,
    },
    {
      title: <TableTitle title={t('withdrawals.lockedUntil')} />,
      dataIndex: 'endAt',
      width: '25%',
      render: (value: string) => <TableText content={moment(value).format(dateFormat)} />,
    },
    {
      title: <TableTitle title={t('withdrawals.type')} />,
      dataIndex: 'type',
      width: '15%',
      render: (value: string) => (
        <TableText>
          {value === WithdrawalType.UNSTAKE ? t('withdrawals.unstaking') : t('withdrawals.unDelegation')}
        </TableText>
      ),
    },
    {
      title: <TableTitle title={t('withdrawals.status')} />,
      dataIndex: 'lockStatus',
      width: '15%',
      render: (value: LOCK_STATUS) => {
        const tagColor = value === LOCK_STATUS.UNLOCK ? 'success' : 'processing';
        const tagContent = value === LOCK_STATUS.UNLOCK ? t('withdrawals.unlocked') : t('withdrawals.locked');
        return <Tag color={tagColor}>{tagContent}</Tag>;
      },
    },
    {
      title: <TableTitle title={t('general.action')}></TableTitle>,
      dataIndex: 'index',
      width: '25%',
      render: (id, record) => <CancelUnbonding id={id} type={record.type} onSuccess={getWithdrawals}></CancelUnbonding>,
    },
  ];

  React.useEffect(() => {
    getWithdrawals();
  }, []);

  return (
    <div className={styles.withdrawnContainer}>
      {renderAsyncArray(
        mapAsync(
          ([withdrawlsResult, lockPeriod]) =>
            withdrawlsResult?.withdrawls?.nodes.filter(notEmpty).map((withdrawal, idx) => {
              const utcStartAt = moment.utc(withdrawal?.startTime);
              const utcEndAt = moment.utc(utcStartAt).add(lockPeriod || defaultLockPeriod, 'second');
              const lockStatus = moment.utc() > utcEndAt ? LOCK_STATUS.UNLOCK : LOCK_STATUS.LOCK;
              return { ...withdrawal, endAt: utcEndAt.local().format(), lockStatus, idx };
            }),
          mergeAsync(withdrawals, lockPeriod),
        ),
        {
          error: (e) => <Typography>{`Error: Fail to get Indexers ${e.message}`}</Typography>,
          loading: () => <Spinner />,
          empty: () => <EmptyList title={t('withdrawals.noWithdrawals')} />,
          data: (data) => {
            const sortedData = data.sort((a, b) => moment(b.endAt).unix() - moment(a.endAt).unix());
            const unlockedRewards = data.filter((withdrawal) => withdrawal.lockStatus === LOCK_STATUS.UNLOCK);
            const hasUnlockedRewards = unlockedRewards?.length > 0;
            const withdrawalsAmountBigNumber = unlockedRewards.reduce((sum, withdrawal) => {
              return sum.add(BigNumber.from(withdrawal.amount));
            }, BigNumber.from('0'));

            const headerTitle = `${t('withdrawals.unlockedAsset', { count: unlockedRewards?.length || 0 })}`;
            const sortedWithdrawalsAmount = formatEther(withdrawalsAmountBigNumber);

            return (
              <div className={styles.container}>
                <div className="flex" style={{ alignItems: 'flex-start' }}>
                  <InfoCircleOutlined style={{ fontSize: 14, color: '#3AA0FF', marginRight: 8, marginTop: 5 }} />
                  <Typography type="secondary" style={{ maxWidth: 820 }}>
                    {t('withdrawals.info')}
                  </Typography>
                  <span style={{ flex: 1 }}></span>
                  <DoWithdraw unlockedAmount={sortedWithdrawalsAmount} disabled={!hasUnlockedRewards} />
                </div>
                <div className={styles.header}>
                  <Typography className={styles.title}>{headerTitle}</Typography>
                </div>
                <Table columns={columns} dataSource={sortedData} rowKey="idx" />
              </div>
            );
          },
        },
      )}
    </div>
  );
};
