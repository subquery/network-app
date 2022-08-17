// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import i18next from 'i18next';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect, Route, Switch } from 'react-router';
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

const SellAUSD = () => {
  // TODO: get kSQT pool size, kSQT:aUSD, from data feed
  const { t } = useTranslation();
  const pair = {
    from: STABLE_TOKEN,
    fromMax: 500,
    to: TOKEN,
    toMax: 300,
  };
  const stats = [
    { title: t('swap.poolSize'), value: '0 kSQT', tooltip: t('swap.poolSizeTooltip') },
    { title: t('swap.curRate'), value: '1 kSQT = 0.02 aUSD', tooltip: t('swap.curRateTooltip') },
  ];

  return <SwapForm stats={stats} pair={pair} />;
};

const GetAUSD = () => {
  // TODO: get kSQT pool size, kSQT:aUSD, from data feed
  const { t } = useTranslation();
  const pair = {
    from: STABLE_TOKEN,
    fromMax: 500,
    to: TOKEN,
    toMax: 300,
  };
  const stats = [
    { title: t('swap.swappableBalance'), value: '0 kSQT', tooltip: t('swap.swappableBalanceTooltip') },
    { title: t('swap.curRate'), value: '1 kSQT = 0.02 aUSD', tooltip: t('swap.curRateTooltip') },
  ];

  return <SwapForm stats={stats} pair={pair} />;
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
