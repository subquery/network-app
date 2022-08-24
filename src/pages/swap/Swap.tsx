// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Typography } from 'antd';
import { BigNumber, BigNumberish } from 'ethers';
import i18next, { TFunction } from 'i18next';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect, Route, Switch } from 'react-router';
import { AppTypography, TabButtons } from '../../components';
import { useSQToken, useWeb3 } from '../../containers';
import { useSellSQTQuota, useSwapPool, useSwapRate } from '../../hooks/useSwapData';
import { formatEther, mergeAsync, renderAsyncArray, STABLE_TOKEN, TOKEN } from '../../utils';
import styles from './Swap.module.css';
import { SwapForm } from './SwapForm';

const SWAP_ROUTE = '/swap';
const SWAP_SELL_ROUTE = `${SWAP_ROUTE}/sell`; //sell native token
const SWAP_BUY_ROUTE = `${SWAP_ROUTE}/buy`; //buy native token

const buttonLinks = [
  { label: i18next.t('swap.buyKSQT'), link: SWAP_BUY_ROUTE },
  { label: i18next.t('swap.sellKSQT'), link: SWAP_SELL_ROUTE },
];

const getStats = ({
  kSQTPoolSize,
  swappableBalance,
  sqtAUSDRate,
  t,
}: {
  kSQTPoolSize?: BigNumberish;
  swappableBalance?: BigNumberish;
  sqtAUSDRate: number;
  t: TFunction;
}) => {
  const curRateStats = {
    title: t('swap.curRate'),
    value: `1 kSQT = ${sqtAUSDRate} aUSD`,
    tooltip: t('swap.curRateTooltip'),
  };

  if (kSQTPoolSize) {
    return [
      { title: t('swap.poolSize'), value: `${kSQTPoolSize} kSQT`, tooltip: t('swap.poolSizeTooltip') },
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

// TODO: loading handler
const SellAUSD = () => {
  const { t } = useTranslation();

  // TODO: get activeOrder
  const getUSDOrderId = 2;
  const swapRate = useSwapRate(getUSDOrderId);
  const swapPool = useSwapPool(getUSDOrderId);

  return renderAsyncArray(mergeAsync(swapRate, swapPool), {
    error: (error) => <Typography.Text type="danger">{`Failed to get indexer info: ${error.message}`}</Typography.Text>,
    empty: () => <Typography.Text type="danger">{`There is no data available`}</Typography.Text>,
    data: (data) => {
      const [kSQTAUSDRate, kSQTPoolSize] = data;
      console.log('data', data);
      const aUSDBalance = '500'; //TODO: stableCoinBalance
      const sortedRate = kSQTAUSDRate ?? 0;
      const sortedPoolSize = kSQTPoolSize ?? '0';

      const pair = {
        from: STABLE_TOKEN,
        fromMax: aUSDBalance,
        to: TOKEN,
        toMax: sortedPoolSize,
      };

      const stats = getStats({ kSQTPoolSize, sqtAUSDRate: sortedRate, t });

      return <SwapForm stats={stats} pair={pair} fromRate={sortedRate} />;
    },
  });
};

const GetAUSD = () => {
  const { t } = useTranslation();
  const { account } = useWeb3();

  const swapRate = useSwapRate(2);
  const tradableQuota = useSellSQTQuota(account ?? '');
  const { balance } = useSQToken();

  return renderAsyncArray(mergeAsync(swapRate, tradableQuota, balance), {
    error: (error) => <Typography.Text type="danger">{`Failed to get indexer info: ${error.message}`}</Typography.Text>,
    empty: () => <Typography.Text type="danger">{`There is no data available`}</Typography.Text>,
    data: (data) => {
      const [swapRate, tradableQuota, sqtBalance] = data;
      const sortedBalance = sqtBalance ?? BigNumber.from('0'); //TODO: stableCoinBalance
      const sortedRate = swapRate ?? 0;
      const sortedPoolSize = tradableQuota ?? BigNumber.from('0');

      const fromMax = sortedBalance.gt(sortedPoolSize) ? tradableQuota : sortedBalance;
      const toMax = sortedBalance;

      const pair = {
        from: TOKEN,
        fromMax: formatEther(fromMax).toString(),
        to: STABLE_TOKEN,
        toMax: formatEther(toMax).toString(),
      };
      const stats = getStats({ swappableBalance: tradableQuota, sqtAUSDRate: sortedRate, t });

      return <SwapForm stats={stats} pair={pair} fromRate={sortedRate} />;
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
