// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Typography } from 'antd';
import { BigNumber, BigNumberish } from 'ethers';
import i18next, { TFunction } from 'i18next';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect, Route, Switch } from 'react-router';
import { ApproveContract, Spinner, TabButtons } from '../../components';
import { useSQToken, useWeb3 } from '../../containers';
import { useSellSQTQuota, useSwapOrderId, useSwapPool, useSwapRate, useSwapToken } from '../../hooks/useSwapData';
import { formatEther, mergeAsync, renderAsyncArray, STABLE_TOKEN, STABLE_TOKEN_ADDRESS, TOKEN } from '../../utils';
import styles from './Swap.module.css';
import { SwapForm } from './SwapForm';
import { SQToken } from '@subql/contract-sdk/publish/moonbase.json';
import { useAUSDAllowance, useAUSDBalance, useAUSDContract, useAUSDTotalSupply } from '../../hooks/useASUDContract';

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
    value: `1 ${tokenGet} = ${sqtAUSDRate} ${tokenGive}`,
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
  const { orderId, loading: fetchingOrderId } = useSwapOrderId(SQToken.address ?? '');

  const swapRate = useSwapRate(orderId);
  const swapPool = useSwapPool(orderId);
  const swapTokens = useSwapToken(orderId);
  const aUSDBalance = useAUSDBalance();
  const aUSDTotalSupply = useAUSDTotalSupply();

  return renderAsyncArray(mergeAsync(swapRate, swapPool, swapTokens, aUSDBalance, aUSDTotalSupply), {
    error: (error) => <Typography.Text type="danger">{`Failed to get indexer info: ${error.message}`}</Typography.Text>,
    empty: () => <Typography.Text type="danger">{`There is no data available`}</Typography.Text>,
    data: (data) => {
      const [sqtAUSDRate, sqtPoolSize, tokens, aUSDAmount, aUSDSupply] = data;
      if (sqtAUSDRate === undefined || sqtPoolSize === undefined || fetchingOrderId) return <Spinner />;

      const sortedAUSDBalance = aUSDAmount ?? '0';
      const sortedRate = sqtAUSDRate ?? 0;
      const sortedPoolSize = formatEther(sqtPoolSize, 4) ?? '0';

      const pair = {
        from: STABLE_TOKEN,
        fromMax: sortedAUSDBalance,
        to: TOKEN,
        toMax: sortedPoolSize,
      };

      const stats = getStats({
        sqtPoolSize: sortedPoolSize,
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
          contract={ApproveContract.PermissionedExchange}
          onIncreaseAllowance={aUSDContract?.data?.increaseAllowance}
          onApproveAllowance={() => aUSDAllowance?.refetch()}
          increaseAllowanceAmount={aUSDSupply}
          onUpdateSwapData={() => {
            swapTokens.refetch();
            swapPool.refetch();
            aUSDBalance.refetch();
          }}
        />
      );
    },
  });
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

  return renderAsyncArray(mergeAsync(swapRate, tradableQuota, swapTokens, balance, aUSDBalance), {
    error: (error) => <Typography.Text type="danger">{`Failed to get indexer info: ${error.message}`}</Typography.Text>,
    empty: () => <Typography.Text type="danger">{`There is no data available`}</Typography.Text>,
    data: (data) => {
      const [swapRate, tradeQuota, tokens, sqtBalance, aUSDAmount] = data;
      console.log('aUSDAmount', aUSDAmount);

      if (aUSDAmount === undefined || swapRate === undefined || fetchingOrderId) return <Spinner />;

      const sortedBalance = sqtBalance ?? BigNumber.from('0');
      const sortedRate = swapRate ?? 0;
      const sortedPoolSize = tradeQuota ?? BigNumber.from('0');

      const fromMax = sortedBalance.gt(sortedPoolSize) ? tradeQuota : sortedBalance;
      const toMax = aUSDAmount ?? '0';

      const pair = {
        from: TOKEN,
        fromMax: formatEther(fromMax, 4),
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
            swapTokens.refetch();
            balance.refetch();
            aUSDBalance.refetch();
            tradableQuota.refetch();
          }}
        />
      );
    },
  });
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
