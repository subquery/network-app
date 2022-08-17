// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Button } from 'antd';
import i18next from 'i18next';
import * as React from 'react';
import { Redirect, Route, Switch } from 'react-router';
import { TabButtons } from '../../components';
import styles from './Swap.module.css';
import { SwapForm } from './SwapForm';

const SWAP_ROUTE = '/swap';
const SWAP_SELL_ROUTE = `${SWAP_ROUTE}/sell`; //sell native token
const SWAP_BUY_ROUTE = `${SWAP_ROUTE}/buy`; //buy native token

const buttonLinks = [
  { label: i18next.t('swap.buyKSQT'), link: SWAP_BUY_ROUTE },
  { label: i18next.t('swap.sellKSQT'), link: SWAP_SELL_ROUTE },
];

export const Swap: React.VFC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.tabs}>
          <TabButtons tabs={buttonLinks} whiteTab />
        </div>
        <Switch>
          <Route exact path={SWAP_SELL_ROUTE} component={() => <SwapForm />} />
          <Route exact path={SWAP_BUY_ROUTE} component={() => <SwapForm />} />
          <Redirect from={SWAP_ROUTE} to={SWAP_BUY_ROUTE} />
        </Switch>
      </div>
    </div>
  );
};
