// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useEffect, useMemo, useState } from 'react';
import { BsArrowDownSquareFill, BsLifePreserver } from 'react-icons/bs';
import { useNavigate } from 'react-router';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { WalletRoute } from '@components';
import RpcError from '@components/RpcError';
import { useSQToken } from '@containers';
import { useSortedIndexer } from '@hooks';
import { useDelegating } from '@hooks/useDelegating';
import { FormatCardLine, reduceTotal } from '@pages/account';
import { openNotification, Spinner, Typography } from '@subql/components';
import { WithdrawalStatus } from '@subql/network-query';
import {
  formatEther,
  mergeAsync,
  renderAsync,
  truncFormatEtherStr,
  useAsyncMemo,
  useGetRewardsQuery,
  useGetWithdrawlsQuery,
} from '@subql/react-hooks';
import { formatNumber, isRPCError, parseError } from '@utils';
import { Button, Skeleton } from 'antd';
import BigNumber from 'bignumber.js';
import { useAccount } from 'wagmi';

import { useWeb3Store } from 'src/stores';

import styles from './index.module.less';

const SwapKsqt: FC = () => {
  return <WalletRoute element={<SwapKsqtInner></SwapKsqtInner>}></WalletRoute>;
};

const SwapKsqtInner: FC = () => {
  const { address: account } = useAccount();
  const { contracts } = useWeb3Store();
  const sortedIndexer = useSortedIndexer(account || '');
  const delegating = useDelegating(account ?? '');
  const rewards = useGetRewardsQuery({ variables: { address: account ?? '' } });
  const navigate = useNavigate();
  const withdrawals = useGetWithdrawlsQuery({
    variables: { delegator: account ?? '', status: WithdrawalStatus.ONGOING, offset: 0 },
  });
  const { balance } = useSQToken();

  const [loading, setLoading] = useState(false);

  const totalLocked = useMemo(() => {
    const totalDelegating = formatEther(delegating.data, 4);
    const totalWithdrawn = reduceTotal(withdrawals.data?.withdrawls?.nodes);
    const totalStaking = truncFormatEtherStr(`${sortedIndexer.data?.totalStake?.current ?? 0}`, 4);
    const totalRewards = formatNumber(reduceTotal(rewards.data?.unclaimedRewards?.nodes));

    const total = [totalDelegating, totalWithdrawn, totalStaking, totalRewards]
      .map((i) => BigNumber(i))
      .reduce((add, cur) => add.plus(cur));

    return total.toFixed(4);
  }, [delegating, rewards, withdrawals, sortedIndexer]);

  const tradeToken = async () => {
    if (!balance.data || !account) return;
    try {
      setLoading(true);
      const allowance = await contracts?.sqToken.allowance(account, contracts.tokenExchange.address);
      if (allowance?.lt(balance.data)) {
        openNotification({
          type: 'info',
          description: 'Insufficient allowance, increase allowance first',
        });
        const allowanceTransaction = await contracts?.sqToken.increaseAllowance(
          contracts.tokenExchange.address,
          balance.data,
        );
        await allowanceTransaction?.wait();
      }
      const orderId = await contracts?.tokenExchange.nextOrderId();
      const tradeTransaction = await contracts?.tokenExchange.trade(orderId?.sub(1).toNumber() || 0, balance.data);
      await tradeTransaction?.wait();
      await balance.refetch();

      openNotification({
        type: 'success',
        description: 'Token swap success',
      });
      navigate('/swapksqt/success');
    } catch (e) {
      openNotification({
        type: 'error',
        description: parseError(e),
      });
    } finally {
      setLoading(false);
    }
  };

  const tradeRadio = useAsyncMemo(async () => {
    const orderId = await contracts?.tokenExchange.nextOrderId();
    const res = await contracts?.tokenExchange.orders(orderId?.sub(1).toNumber() || 0);

    if (res) {
      const [_, __, amountGive, amountGet] = res;

      const ratio = BigNumber(amountGive.toString()).div(amountGet.toString());
      if (ratio.toFixed() !== 'NaN') {
        return ratio.toFixed();
      }
      return 1.83;
    }

    return 1.83;
  }, []);

  const disableSwap = useMemo(() => {
    if (!balance.data) return true;
    const zeroBalance = balance.data.toString() === '0';
    if (zeroBalance) return true;
    if (totalLocked !== '0.0000') return true;
    return false;
  }, [balance, totalLocked]);

  useEffect(() => {
    if (!balance.loading && !balance.error) {
      if (balance.data?.toString() === '0' && totalLocked === '0.0000') {
        navigate('/swapksqt/success');
      }
    }
  }, [balance, totalLocked]);

  if (isRPCError(tradeRadio.error) || isRPCError(balance.error)) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 40,
        }}
      >
        <RpcError></RpcError>
      </div>
    );
  }

  return (
    <div className={styles.swapksqt}>
      <Typography variant="h4">Swap</Typography>
      <Typography
        style={{ maxWidth: 421, marginBottom: 24, marginTop: 8, textAlign: 'center' }}
        type="secondary"
        variant="medium"
      >
        SubQuery mainnet has launched, you can now swap your kSQT for real SQT so you can continue on the SubQuery
        Network. The swap is at a fixed rate of 1:{tradeRadio.loading ? <Spinner size={10}></Spinner> : tradeRadio.data}
      </Typography>

      <Typography variant="medium" type="secondary">
        You must swap remaining kSQT before the 31st Jan 2025.
      </Typography>

      <div style={{ display: 'flex', marginTop: 40, gap: 24 }}>
        <div className={styles.swapCard}>
          <Typography
            variant="small"
            type="secondary"
            weight={600}
            style={{ textTransform: 'uppercase', letterSpacing: 1 }}
          >
            Locked kSQT that can’t be swapped
          </Typography>
          <Typography variant="h5" style={{ margin: '8px 0' }}>
            {totalLocked} kSQT
          </Typography>
          <Typography variant="medium" type="secondary">
            Make sure you complete the actions below to unlock remaining kSQT so you can swap it all
          </Typography>

          {renderAsync(mergeAsync(delegating, sortedIndexer, rewards, withdrawals), {
            loading: () => (
              <Skeleton style={{ width: 304, marginTop: 24, flexShrink: 0 }} paragraph={{ rows: 9 }}></Skeleton>
            ),
            error: (e) => {
              if (isRPCError(e)) {
                return (
                  <RpcError
                    size="small"
                    tryAgain={() => {
                      delegating.refetch();
                      sortedIndexer?.refresh?.();
                      rewards.refetch();
                      withdrawals.refetch();
                    }}
                  ></RpcError>
                );
              }
              return <Typography>{`Failed to load account details: ${e}`}</Typography>;
            },
            data: (data) => {
              const [d, i, r, w] = data;
              const totalDelegating = formatEther(d, 4);
              const totalWithdrawn = reduceTotal(w?.withdrawls?.nodes);
              const totalStaking = truncFormatEtherStr(`${i?.totalStake?.current ?? 0}`, 4);

              return (
                <div className="col-flex" style={{ marginTop: 24, width: '100%', textAlign: 'left' }}>
                  <FormatCardLine
                    title="Unclaimed Rewards"
                    amount={formatNumber(reduceTotal(r?.unclaimedRewards?.nodes))}
                    extra={
                      BigNumber(formatNumber(reduceTotal(r?.unclaimedRewards?.nodes))).eq(0) ? (
                        <CheckCircleOutlined style={{ color: 'var(--sq-success)' }} />
                      ) : (
                        <CloseCircleOutlined style={{ color: 'var(--sq-error)' }} />
                      )
                    }
                    linkName="Claim kSQT Rewards"
                    link="/profile/rewards"
                  ></FormatCardLine>
                  <FormatCardLine
                    title="Total Delegation"
                    amount={formatNumber(totalDelegating)}
                    extra={
                      BigNumber(formatNumber(totalDelegating)).eq(0) ? (
                        <CheckCircleOutlined style={{ color: 'var(--sq-success)' }} />
                      ) : (
                        <CloseCircleOutlined style={{ color: 'var(--sq-error)' }} />
                      )
                    }
                    linkName="Undelegate kSQT"
                    link="/delegator/delegating"
                  ></FormatCardLine>
                  <FormatCardLine
                    title="Total Staking"
                    amount={formatNumber(totalStaking)}
                    extra={
                      BigNumber(formatNumber(totalStaking)).eq(0) ? (
                        <CheckCircleOutlined style={{ color: 'var(--sq-success)' }} />
                      ) : (
                        <CloseCircleOutlined style={{ color: 'var(--sq-error)' }} />
                      )
                    }
                    linkName="Unstake kSQT"
                    link="/indexer/my-staking"
                  ></FormatCardLine>
                  <FormatCardLine
                    title="Pending withdrawals"
                    amount={formatNumber(totalWithdrawn)}
                    extra={
                      BigNumber(formatNumber(totalWithdrawn)).eq(0) ? (
                        <CheckCircleOutlined style={{ color: 'var(--sq-success)' }} />
                      ) : (
                        <CloseCircleOutlined style={{ color: 'var(--sq-error)' }} />
                      )
                    }
                    linkName="Complete kSQT Withdrawals"
                    link="/profile/withdrawn"
                  ></FormatCardLine>
                </div>
              );
            },
          })}
        </div>

        <div className={styles.swapCard}>
          <Typography
            variant="small"
            type="secondary"
            weight={600}
            style={{ textTransform: 'uppercase', letterSpacing: 1 }}
          >
            SWAPPABLE kSQT
          </Typography>

          <Typography variant="h5" style={{ margin: '8px 0' }}>
            {formatEther(balance.data, 4)} kSQT
          </Typography>

          <div className={styles.smallCard}>
            <div className={styles.top}>kSQT</div>

            <div className={styles.bottom}>
              <Typography variant="large" weight={600} type="secondary">
                {formatEther(balance.data, 4)}
              </Typography>
            </div>
          </div>

          <BsArrowDownSquareFill style={{ margin: '16px 0', color: 'var(--sq-gray600)', fontSize: 24 }} />

          <div className={styles.smallCard}>
            <div className={styles.top}>SQT</div>

            <div className={styles.bottom}>
              <Typography variant="large" weight={600} type="secondary">
                {BigNumber(formatEther(balance.data, 4).toString() || '0')
                  .multipliedBy(tradeRadio.data?.toString() || '1.83')
                  .toFixed(4)}
              </Typography>
            </div>
          </div>

          <Button
            shape="round"
            type="primary"
            size="large"
            style={{ width: '100%', marginTop: 24, marginBottom: 8 }}
            disabled={disableSwap}
            loading={loading}
            onClick={() => {
              tradeToken();
            }}
          >
            Swap
          </Button>

          <Typography type="secondary" variant="small">
            You must swap before the 31st Jan 2025
          </Typography>

          <Typography type="secondary" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 24 }}>
            <BsLifePreserver />
            Need help? please
            <Typography.Link active href="https://discord.com/invite/subquery">
              contact us
            </Typography.Link>
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default SwapKsqt;
