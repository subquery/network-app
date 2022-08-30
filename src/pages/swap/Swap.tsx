// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Typography } from 'antd';
import { BigNumber, BigNumberish } from 'ethers';
import i18next, { TFunction } from 'i18next';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect, Route, Switch } from 'react-router';
import { ApproveContract, AppTypography, Spinner, TabButtons } from '../../components';
import { useSQToken, useWeb3 } from '../../containers';
import { useSellSQTQuota, useSwapOrderId, useSwapPool, useSwapRate } from '../../hooks/useSwapData';
import { formatEther, mergeAsync, renderAsyncArray, STABLE_TOKEN, STABLE_TOKEN_ADDRESS, TOKEN } from '../../utils';
import styles from './Swap.module.css';
import { SwapForm } from './SwapForm';
import { SQToken } from '@subql/contract-sdk/publish/moonbase.json';
import { useAUSDAllowance, useAUSDBalance, useAUSDContract } from '../../hooks/useASUDContract';

const SWAP_ROUTE = '/swap';
const SWAP_SELL_ROUTE = `${SWAP_ROUTE}/sell`; //sell native token
const SWAP_BUY_ROUTE = `${SWAP_ROUTE}/buy`; //buy native token

const buttonLinks = [
  { label: i18next.t('swap.buyKSQT'), link: SWAP_BUY_ROUTE },
  { label: i18next.t('swap.sellKSQT'), link: SWAP_SELL_ROUTE },
];

const getStats = ({
  sqtPoolSize,
  swappableBalance,
  sqtAUSDRate,
  t,
}: {
  sqtPoolSize?: BigNumberish;
  swappableBalance?: BigNumberish;
  sqtAUSDRate: number;
  t: TFunction;
}) => {
  const curRateStats = {
    title: t('swap.curRate'),
    value: `1 kSQT = ${sqtAUSDRate} aUSD`,
    tooltip: t('swap.curRateTooltip'),
  };

  if (sqtPoolSize) {
    return [
      { title: t('swap.poolSize'), value: `${sqtPoolSize} kSQT`, tooltip: t('swap.poolSizeTooltip') },
      curRateStats,
    ];
  }

  return [
    {
      title: t('swap.swappableBalance'),
      value: `${swappableBalance ?? 0} kSQT`,
      tooltip: t('swap.swappableBalanceTooltip'),
    },
    curRateStats,
  ];
};

// TODO: replace with aUSD sdk pkg when switch back to acala network
// TODO: when order is undefined at useSwapData, upon design confirm
const SellAUSD = () => {
  const { t } = useTranslation();

  const aUSDContract = useAUSDContract();
  const aUSDAllowance = useAUSDAllowance();
  const requireTokenApproval = aUSDAllowance?.data?.isZero();
  const { orderId, loading: fetchingOrderId } = useSwapOrderId(STABLE_TOKEN_ADDRESS ?? '');

  const swapRate = useSwapRate(orderId);
  const swapPool = useSwapPool(orderId);
  const aUSDBalance = useAUSDBalance();

  return renderAsyncArray(mergeAsync(swapRate, swapPool, aUSDBalance), {
    error: (error) => <Typography.Text type="danger">{`Failed to get indexer info: ${error.message}`}</Typography.Text>,
    empty: () => <Typography.Text type="danger">{`There is no data available`}</Typography.Text>,
    data: (data) => {
      const [sqtAUSDRate, sqtPoolSize, aUSDAmount] = data;
      if (sqtPoolSize === undefined || sqtPoolSize === undefined || fetchingOrderId) return <Spinner />;

      const aUSDBalance = formatEther(aUSDAmount, 4) ?? '0';
      const sortedRate = sqtAUSDRate ?? 0;
      const sortedPoolSize = formatEther(sqtPoolSize, 4) ?? '0';

      const pair = {
        from: STABLE_TOKEN,
        fromMax: aUSDBalance,
        to: TOKEN,
        toMax: sortedPoolSize,
      };

      const stats = getStats({ sqtPoolSize: sortedPoolSize, sqtAUSDRate: sortedRate, t });

      return (
        <SwapForm
          stats={stats}
          pair={pair}
          fromRate={sortedRate}
          orderId={orderId}
          requireTokenApproval={!!requireTokenApproval}
          contractAddress={aUSDContract.data?.address}
          onIncreaseAllowance={aUSDContract?.data?.increaseAllowance}
          // onApproveAllowance={} TODO: call refetch utils when for real aUSD contract
        />
      );
    },
  });
};

const GetAUSD = () => {
  const { t } = useTranslation();
  const { account } = useWeb3();
  const { permissionExchangeAllowance } = useSQToken();
  const requireTokenApproval = permissionExchangeAllowance?.data?.isZero();

  const { orderId, loading: fetchingOrderId } = useSwapOrderId(SQToken.address ?? '');

  // TODO: when order is undefined, upon design confirm
  const swapRate = useSwapRate(orderId);
  const tradableQuota = useSellSQTQuota(account ?? '');
  const { balance } = useSQToken();

  return renderAsyncArray(mergeAsync(swapRate, tradableQuota, balance), {
    error: (error) => <Typography.Text type="danger">{`Failed to get indexer info: ${error.message}`}</Typography.Text>,
    empty: () => <Typography.Text type="danger">{`There is no data available`}</Typography.Text>,
    data: (data) => {
      const [swapRate, tradableQuota, sqtBalance] = data;

      if (swapRate === undefined || tradableQuota === undefined || fetchingOrderId) return <Spinner />;

      const sortedBalance = sqtBalance ?? BigNumber.from('0');
      const sortedRate = !swapRate ? 0 : 1 / swapRate;
      const sortedPoolSize = tradableQuota ?? BigNumber.from('0');

      const fromMax = sortedBalance.gt(sortedPoolSize) ? tradableQuota : sortedBalance;
      const toMax = sortedBalance;

      const pair = {
        from: TOKEN,
        fromMax: formatEther(fromMax, 4),
        to: STABLE_TOKEN,
        toMax: formatEther(toMax, 4),
      };

      const stats = getStats({
        swappableBalance: formatEther(tradableQuota, 4),
        sqtAUSDRate: sortedRate, // NOTE: as always display xSQT:xAUSD
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
        />
      );
    },
  });
};

export const Swap: React.VFC = () => {
  const { t } = useTranslation();
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.tabs}>
          <TabButtons tabs={buttonLinks} whiteTab />
        </div>
        <Switch>
          <Route exact path={SWAP_SELL_ROUTE} component={() => <GetAUSD />} />
          <Route exact path={SWAP_BUY_ROUTE} component={() => <SellAUSD />} />
          <Redirect from={SWAP_ROUTE} to={SWAP_BUY_ROUTE} />
        </Switch>
      </div>

      <AppTypography className={styles.dataUpdateText}>{t('swap.dataUpdateEvery5Min')}</AppTypography>
    </div>
  );
};
