// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { BsExclamationCircle } from 'react-icons/bs';
import InfoCircleOutlined from '@ant-design/icons/InfoCircleOutlined';
import { EmptyList } from '@components/EmptyList';
import { useMakeNotification } from '@components/NotificationCentre/useMakeNotification';
import { TokenAmount } from '@components/TokenAmount';
import TransactionModal from '@components/TransactionModal';
import { useWeb3 } from '@containers';
import { useLockPeriod } from '@hooks';
import { useWaitTransactionhandled } from '@hooks/useWaitTransactionHandled';
import { openNotification, Spinner, Typography } from '@subql/components';
import { TableText, TableTitle } from '@subql/components';
import { WithdrawalFieldsFragment as Withdrawls, WithdrawalType } from '@subql/network-query';
import { WithdrawalStatus } from '@subql/network-query';
import { useGetWithdrawlsLazyQuery } from '@subql/react-hooks';
import { formatEther, LOCK_STATUS, mapAsync, mergeAsync, notEmpty, renderAsyncArray } from '@utils';
import { Button, Table, TableProps, Tag } from 'antd';
import assert from 'assert';
import dayjs from 'dayjs';
import { BigNumber, ContractReceipt } from 'ethers';
import { t } from 'i18next';
import { capitalize } from 'lodash-es';

import { useWeb3Store } from 'src/stores';

import { DoWithdraw } from '../DoWithdraw';
import styles from './Locked.module.less';

interface SortedWithdrawals extends Withdrawls {
  idx: number;
  endAt: string;
  lockStatus: LOCK_STATUS;
}

const dateFormat = 'MMMM Do YY, h:mm:ss a';

const cancelWithdrwalsTextAndTips = {
  [WithdrawalType.UNDELEGATION]: {
    text: t('general.cancelUndelegation'),
    tips: t('general.cancelUndelegationTips'),
  },
  [WithdrawalType.UNSTAKE]: {
    text: t('general.cancelUnstaking'),
    tips: t('general.cancelUnstakingTips'),
  },
  [WithdrawalType.COMMISSION]: {
    text: t('general.cancelCommission'),
    tips: t('general.cancelCommissionTips'),
  },
  [WithdrawalType.MERGE]: {
    text: t('general.cancelUnstaking'),
    tips: t('general.cancelUnstakingTips'),
  },
};

const CancelUnbonding: React.FC<{
  id: string;
  type: WithdrawalType;
  indexerAddress: string;
  onSuccess?: (params?: unknown, txReceipt?: ContractReceipt) => void;
}> = ({ id, type, indexerAddress, onSuccess }) => {
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
        actions={[
          {
            label: capitalize(t('general.cancel')),
            key: 'claim',
            onClick: async () => {
              const res = await contracts?.indexerRegistry.isIndexer(indexerAddress);
              if (!res) {
                openNotification({
                  type: 'error',
                  description: "This indexer has been unregistered. The stake can't be cancel.",
                  duration: 3,
                });
                throw new Error('Not an indexer');
              }
            },
          },
        ]}
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
                  {cancelWithdrwalsTextAndTips[type].text}
                </Typography>
              </div>
              <Typography variant="medium" style={{ marginLeft: 38, marginBottom: 32, color: 'var(--sq--gray700)' }}>
                {cancelWithdrwalsTextAndTips[type].tips}
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

const withdrwalsTypeText = {
  [WithdrawalType.UNSTAKE]: t('withdrawals.unstaking'),
  [WithdrawalType.UNDELEGATION]: t('withdrawals.unDelegation'),
  [WithdrawalType.COMMISSION]: t('withdrawals.commission'),
  [WithdrawalType.MERGE]: t('withdrawals.merge'),
};

export const Locked: React.FC = () => {
  const { t } = useTranslation();
  const { account } = useWeb3();
  const waitTransactionHandled = useWaitTransactionhandled();
  const { refreshAndMakeUnlockWithdrawalNotification } = useMakeNotification();
  const filterParams = {
    delegator: account || '',
    status: WithdrawalStatus.ONGOING,
    offset: 0,
  };
  const [getWithdrawals, withdrawals] = useGetWithdrawlsLazyQuery({
    variables: filterParams,
    fetchPolicy: 'network-only',
  });

  const lockPeriod = useLockPeriod();

  const columns: TableProps<SortedWithdrawals>['columns'] = [
    {
      title: <TableTitle title={'#'} />,
      width: '10%',
      dataIndex: 'index',
      render: (t) => <TableText content={t} />,
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
      render: (value: string) => <TableText content={dayjs(value).format(dateFormat)} />,
    },
    {
      title: <TableTitle title={t('withdrawals.type')} />,
      dataIndex: 'type',
      width: '15%',
      render: (value: WithdrawalType) => <TableText>{withdrwalsTypeText[value]}</TableText>,
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
      render: (id, record) => (
        <CancelUnbonding
          id={id}
          indexerAddress={record.indexer}
          type={record.type}
          onSuccess={async (_, receipt) => {
            await waitTransactionHandled(receipt?.blockNumber);
            await getWithdrawals();
            refreshAndMakeUnlockWithdrawalNotification();
          }}
        ></CancelUnbonding>
      ),
    },
  ];

  React.useEffect(() => {
    getWithdrawals();
  }, []);

  // if (withdrawals.loading || lockPeriod.loading) return <Spinner />;
  return (
    <div className={styles.withdrawnContainer}>
      {renderAsyncArray(
        mapAsync(
          ([withdrawlsResult, lockPeriod]) =>
            withdrawlsResult?.withdrawls?.nodes.filter(notEmpty).map((withdrawal, idx) => {
              const utcStartAt = dayjs.utc(withdrawal?.startTime);
              const utcEndAt = dayjs.utc(utcStartAt).add(lockPeriod as number, 'second');
              const lockStatus = dayjs.utc() > utcEndAt ? LOCK_STATUS.UNLOCK : LOCK_STATUS.LOCK;
              return { ...withdrawal, endAt: utcEndAt.local().format(), lockStatus, idx };
            }),
          mergeAsync(withdrawals, lockPeriod),
        ),
        {
          error: (e) => <Typography>{`Error: Fail to get Indexers ${e.message}`}</Typography>,
          loading: () => <Spinner />,
          empty: () => <EmptyList title={t('withdrawals.noWithdrawals')} />,
          data: (data) => {
            const sortedData = data.sort((a, b) => dayjs(b.endAt).unix() - dayjs(a.endAt).unix());
            const unlockedRewards = data.filter((withdrawal) => withdrawal.lockStatus === LOCK_STATUS.UNLOCK);
            const hasUnlockedRewards = unlockedRewards?.length > 0;
            const withdrawalsAmountBigNumber = unlockedRewards.reduce((sum, withdrawal) => {
              return sum.add(BigNumber.from(withdrawal.amount));
            }, BigNumber.from('0'));

            const headerTitle = `${t('withdrawals.unlockedAsset', { count: unlockedRewards?.length || 0 })}`;
            const sortedWithdrawalsAmount = formatEther(withdrawalsAmountBigNumber);

            return (
              <div className={styles.container}>
                <div className="flex">
                  <InfoCircleOutlined style={{ fontSize: 14, color: '#3AA0FF', marginRight: 8, marginTop: 5 }} />
                  <Typography type="secondary" style={{ maxWidth: 820 }}>
                    {t('withdrawals.info')}
                  </Typography>
                  <span style={{ flex: 1 }}></span>
                  <DoWithdraw
                    onSuccess={async (_, receipt) => {
                      await waitTransactionHandled(receipt?.blockNumber);
                      await getWithdrawals();
                      refreshAndMakeUnlockWithdrawalNotification();
                    }}
                    unlockedAmount={sortedWithdrawalsAmount}
                    disabled={!hasUnlockedRewards}
                  />
                </div>
                <div className={styles.header}>
                  <Typography className={styles.title}>{headerTitle}</Typography>
                </div>
                <Table columns={columns} dataSource={sortedData} rowKey="idx" scroll={{ x: 600 }} />
              </div>
            );
          },
        },
      )}
    </div>
  );
};
