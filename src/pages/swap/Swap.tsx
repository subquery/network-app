// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BigNumber, BigNumberish } from 'ethers';
import i18next, { TFunction } from 'i18next';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect, Route, Switch, useLocation } from 'react-router';
import { TabButtons } from '../../components';
import { STABLE_TOKEN, TOKEN } from '../../utils';
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
  kSQTAUSDRate,
  t,
}: {
  kSQTPoolSize?: BigNumberish;
  swappableBalance?: BigNumberish;
  kSQTAUSDRate: number;
  t: TFunction;
}) => {
  const curRateStats = {
    title: t('swap.curRate'),
    value: `1 kSQT = ${1 / kSQTAUSDRate} aUSD`,
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

const SellAUSD = () => {
  const { t } = useTranslation();
  // TODO: get kSQT pool size, kSQT:aUSD, from contract
  const kSQTPoolSize = BigNumber.from('100');
  const kSQTAUSDRate = 1 / 0.02;
  const aUSDBalance = BigNumber.from('500');

  const fromMax = aUSDBalance;
  const toMax = kSQTPoolSize;
  const pair = {
    from: STABLE_TOKEN,
    fromMax,
    to: TOKEN,
    toMax,
  };

  const stats = getStats({ kSQTPoolSize, kSQTAUSDRate, t });

  return <SwapForm stats={stats} pair={pair} fromRate={1 / kSQTAUSDRate} />;
};

const GetAUSD = () => {
  const { t } = useTranslation();

  // TODO: get kSQT pool size, kSQT:aUSD, from contract
  const kSQTAUSDRate = 1 / 0.02;
  const swappableBalance = BigNumber.from('50');
  const kSQTBalance = BigNumber.from('500');

  const fromMax = kSQTBalance.gt(swappableBalance) ? swappableBalance : kSQTBalance;
  const toMax = kSQTBalance;

  const pair = {
    from: STABLE_TOKEN,
    fromMax,
    to: TOKEN,
    toMax: toMax,
  };
  const stats = getStats({ swappableBalance, kSQTAUSDRate, t });

  return <SwapForm stats={stats} pair={pair} fromRate={kSQTAUSDRate} />;
};

export const Swap: React.VFC = () => {
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
    </div>
  );
};
