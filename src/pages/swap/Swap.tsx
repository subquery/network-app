// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, Route, Routes } from 'react-router';
import { ApproveContract, EmptyList, Spinner, TabButtons } from '@components';
import { useSQToken, useWeb3 } from '@containers';
import { SQT_TOKEN_ADDRESS } from '@containers/Web3';
import { useAUSDAllowance, useAUSDBalance, useAUSDContract, useAUSDTotalSupply } from '@hooks/useASUDContract';
import {
  useSellSQTQuota,
  useSwapOrderId,
  useSwapPool,
  useSwapRate,
  useSwapToken,
  useSwapTradeLimitation,
} from '@hooks/useSwapData';
import { Footer } from '@subql/components';
import {
  formatEther,
  mergeAsync,
  parseError,
  renderAsyncArray,
  ROUTES,
  STABLE_TOKEN,
  STABLE_TOKEN_ADDRESS,
  TOKEN,
} from '@utils';
import { Typography } from 'antd';
import { BigNumber, BigNumberish } from 'ethers';
import i18next, { TFunction } from 'i18next';

import styles from './Swap.module.css';
import { SwapForm } from './SwapForm';

const { SWAP, SELL, BUY } = ROUTES;

const buttonLinks = [
  { label: i18next.t('swap.buykSQT'), link: `${SWAP}/${BUY}` },
  { label: i18next.t('swap.sellkSQT'), link: `${SWAP}/${SELL}` },
];

const getStats = ({
  sqtPoolSize,
  swappableBalance,
  sqtAUSDRate,
  tokenGet,
  tokenGive,
  t,
}: {
  sqtPoolSize?: BigNumberish;
  swappableBalance?: BigNumberish;
  tokenGet: string;
  tokenGive: string;
  sqtAUSDRate: number;
  t: TFunction;
}) => {
  const curRateStats = {
    title: t('swap.curRate'),
    value: sqtAUSDRate > 0 ? `1 ${tokenGet} = ${sqtAUSDRate} ${tokenGive}` : '-',
    tooltip: t('swap.curRateTooltip'),
  };

  if (sqtPoolSize) {
    return [
      {
        title: t('swap.poolSize'),
        value: `${sqtPoolSize} ${TOKEN}`,
        tooltip: t('swap.poolSizeTooltip'),
      },
      curRateStats,
    ];
  }

  return [
    {
      title: t('swap.swappableBalance'),
      value: `${swappableBalance ?? 0} ${TOKEN}`,
      tooltip: t('swap.swappableBalanceTooltip'),
    },
    curRateStats,
  ];
};

const SellAUSD = () => {
  const { t } = useTranslation();

  const aUSDContract = useAUSDContract();
  const aUSDAllowance = useAUSDAllowance();
  const requireTokenApproval = aUSDAllowance?.data?.isZero();
  const { orderId, loading: fetchingOrderId } = useSwapOrderId(SQT_TOKEN_ADDRESS ?? '');

  const swapRate = useSwapRate(orderId);
  const swapPool = useSwapPool(orderId);
  const swapTokens = useSwapToken(orderId);
  const aUSDBalance = useAUSDBalance();
  const aUSDTotalSupply = useAUSDTotalSupply();
  const usdcToSqtLimitation = useSwapTradeLimitation();
  if (fetchingOrderId) return <Spinner />;

  if (!orderId) return <EmptyList title={t('swap.nonOrder')} description={t('swap.nonOrderDesc')} />;

  return renderAsyncArray(
    mergeAsync(swapRate, swapPool, swapTokens, aUSDBalance, aUSDTotalSupply, usdcToSqtLimitation),
    {
      error: (error) => {
        return <Typography.Text type="danger">{`Failed to load info: ${parseError(error) || ''}`}</Typography.Text>;
      },
      empty: () => <Typography.Text type="danger">{`There is no data available`}</Typography.Text>,
      data: (data) => {
        const [sqtAUSDRate, sqtPoolSize, tokens, aUSDAmount, aUSDSupply, usdcToSqtLimitation] = data;
        if (sqtAUSDRate === undefined || sqtPoolSize === undefined || fetchingOrderId) return <Spinner />;

        const sortedAUSDBalance = aUSDAmount ?? '0';
        const sortedRate = sqtAUSDRate ?? 0;
        const sortedPoolSize = sqtPoolSize ?? '0';
        const pair = {
          from: STABLE_TOKEN,
          fromMax: sortedAUSDBalance,
          to: TOKEN,
          toMax: formatEther(sortedPoolSize),
        };

        const stats = getStats({
          sqtPoolSize: formatEther(sortedPoolSize, 4),
          sqtAUSDRate: sortedRate,
          tokenGet: tokens?.tokenGet ?? '',
          tokenGive: tokens?.tokenGive ?? '',
          t,
        });

        return (
          <SwapForm
            stats={stats}
            pair={pair}
            fromRate={sortedRate}
            usdcLimitation={usdcToSqtLimitation as BigNumber}
            orderId={orderId}
            requireTokenApproval={!!requireTokenApproval}
            contract={ApproveContract.PermissionedExchange}
            onIncreaseAllowance={aUSDContract?.data?.increaseAllowance}
            onApproveAllowance={() => aUSDAllowance?.refetch()}
            increaseAllowanceAmount={aUSDSupply}
            onUpdateSwapData={() => {
              swapTokens.refetch(true);
              swapPool.refetch(true);
              aUSDBalance.refetch(true);
            }}
          />
        );
      },
    },
  );
};

// TODO: Improve useSwapToken function: as current use TOKEN in util / useSwapToken two places
const GetAUSD = () => {
  const { t } = useTranslation();
  const { account } = useWeb3();
  const { permissionExchangeAllowance } = useSQToken();
  const requireTokenApproval = permissionExchangeAllowance?.data?.isZero();

  const { orderId, loading: fetchingOrderId } = useSwapOrderId(STABLE_TOKEN_ADDRESS ?? '');

  const swapRate = useSwapRate(orderId);
  const swapTokens = useSwapToken(orderId);
  const tradableQuota = useSellSQTQuota(account ?? '');
  const { balance } = useSQToken();
  const aUSDBalance = useAUSDBalance();

  if (fetchingOrderId) return <Spinner />;

  if (!orderId) return <EmptyList title={t('swap.nonOrder')} description={t('swap.nonOrderDesc')} />;

  return renderAsyncArray(mergeAsync(swapRate, tradableQuota, swapTokens, balance, aUSDBalance), {
    error: (error) => (
      <Typography.Text type="danger">
        {t('errors.failedToGetIndexerInfo', { message: parseError(error) || '' })}
      </Typography.Text>
    ),
    empty: () => <Typography.Text type="danger">{`There is no data available`}</Typography.Text>,
    data: (data) => {
      const [swapRate, tradeQuota, tokens, sqtBalance, aUSDAmount] = data;

      if (aUSDAmount === undefined || swapRate === undefined || fetchingOrderId) return <Spinner />;

      const sortedBalance = sqtBalance ?? BigNumber.from('0');
      const sortedRate = swapRate ?? 0;
      const sortedPoolSize = tradeQuota ?? BigNumber.from('0');

      const fromMax = sortedBalance.gt(sortedPoolSize) ? tradeQuota : sortedBalance;
      const toMax = aUSDAmount ?? '0';

      const pair = {
        from: TOKEN,
        fromMax: formatEther(fromMax),
        to: STABLE_TOKEN,
        toMax,
      };

      const stats = getStats({
        swappableBalance: formatEther(tradeQuota, 4),
        sqtAUSDRate: sortedRate,
        tokenGet: tokens?.tokenGet ?? '',
        tokenGive: tokens?.tokenGive ?? '',
        t,
      });

      return (
        <SwapForm
          stats={stats}
          pair={pair}
          fromRate={sortedRate}
          orderId={orderId}
          requireTokenApproval={!!requireTokenApproval}
          onApproveAllowance={() => requireTokenApproval && permissionExchangeAllowance.refetch()}
          contract={ApproveContract.PermissionedExchange}
          onUpdateSwapData={() => {
            swapTokens.refetch(true);
            balance.refetch(true);
            aUSDBalance.refetch(true);
            tradableQuota.refetch(true);
          }}
        />
      );
    },
  });
};

export const Swap: React.FC = () => {
  return (
    <div className={styles.swap}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.tabs}>
            <TabButtons tabs={buttonLinks} whiteTab />
          </div>
          <Routes>
            <Route index path={BUY} element={<SellAUSD />} />
            <Route path={SELL} element={<GetAUSD />} />
            <Route path={'/'} element={<Navigate replace to={BUY} />} />
          </Routes>
        </div>
      </div>
      <Footer simple />
    </div>
  );
};
