// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, Route, Routes } from 'react-router';
import { ApproveContract, EmptyList, Spinner, TabButtons, WalletRoute } from '@components';
import { useSQToken, useWeb3 } from '@containers';
import { SQT_TOKEN_ADDRESS } from '@containers/Web3';
import { useAirdropKyc } from '@hooks/useAirdropKyc';
import { useAUSDAllowance, useAUSDBalance, useAUSDContract, useAUSDTotalSupply } from '@hooks/useASUDContract';
import {
  useSellSQTQuota,
  useSwapOrderId,
  useSwapPool,
  useSwapRate,
  useSwapToken,
  useSwapTradeLimitation,
} from '@hooks/useSwapData';
import { Footer, openNotification } from '@subql/components';
import {
  formatEther,
  mergeAsync,
  parseError,
  renderAsyncArray,
  ROUTES,
  STABLE_TOKEN,
  STABLE_TOKEN_ADDRESS,
  STABLE_TOKEN_DECIMAL,
  TOKEN,
} from '@utils';
import { Typography } from 'antd';
import { BigNumber, BigNumberish } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import i18next, { TFunction } from 'i18next';

import { useWeb3Store } from 'src/stores';

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

const useGetUSDCTradeLimitation = () => {
  const { account } = useWeb3();
  const { contracts } = useWeb3Store();
  const aUSDBalance = useAUSDBalance();
  const [maxTradelimitation, setMaxTradeLimitation] = React.useState(0);

  const initMaxTradeLimitation = async () => {
    try {
      if (!aUSDBalance.data) return 0;

      // returned values are USDC
      const tradeLimitationPerAccount =
        (await contracts?.permissionedExchange.tradeLimitationPerAccount()) || BigNumber.from(0);
      const accumulatedTrades =
        (await contracts?.permissionedExchange.accumulatedTrades(account || '')) || BigNumber.from(0);

      const tradeLimitation = (await contracts?.permissionedExchange.tradeLimitation()) || BigNumber.from(0);

      const formatedTradeLimitation = formatUnits(tradeLimitation, STABLE_TOKEN_DECIMAL);
      const formtedTradelimitationPerAccount = formatUnits(tradeLimitationPerAccount, STABLE_TOKEN_DECIMAL);
      const formatedAccumulatedTrades = formatUnits(accumulatedTrades, STABLE_TOKEN_DECIMAL);

      return Math.min(
        +aUSDBalance.data,
        +formatedTradeLimitation,
        +formtedTradelimitationPerAccount - +formatedAccumulatedTrades,
      );
    } catch (e) {
      console.warn(e);
      openNotification({
        type: 'error',
        description: 'Fetch trade limitation failed, please change your RPC Endpoint and try again.',
      });

      return 0;
    }
  };

  const init = async () => {
    const res = await initMaxTradeLimitation();

    setMaxTradeLimitation(res);
  };

  React.useEffect(() => {
    init();
  }, [account, aUSDBalance.data]);

  return maxTradelimitation;
};

const USDCToSqt = () => {
  const { t } = useTranslation();
  const { account } = useWeb3();
  const [kycStatus, setKycStatus] = React.useState(false);
  const maxTradeLimitation = useGetUSDCTradeLimitation();
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
  const { getKycStatus } = useAirdropKyc();

  const initKyc = async (address: string) => {
    const res = await getKycStatus(address);
    setKycStatus(res);
  };

  React.useEffect(() => {
    setKycStatus(false);
    if (account) {
      initKyc(account);
    }
  }, [account, aUSDBalance.data]);

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
        const [sqtAUSDRate, sqtPoolSize, tokens, _, aUSDSupply, usdcToSqtLimitation] = data;
        if (sqtAUSDRate === undefined || sqtPoolSize === undefined || fetchingOrderId) return <Spinner />;

        // const sortedAUSDBalance = aUSDAmount ?? '0';
        const sortedRate = sqtAUSDRate ?? 0;
        const sortedPoolSize = sqtPoolSize ?? '0';
        const pair = {
          from: STABLE_TOKEN,
          fromMax: maxTradeLimitation.toString(),
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
            kycStatus={kycStatus}
          />
        );
      },
    },
  );
};

// TODO: Improve useSwapToken function: as current use TOKEN in util / useSwapToken two places
const SqtToUSDC = () => {
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
  const maxTradeLimitation = useGetUSDCTradeLimitation();

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

      const pair = {
        from: TOKEN,
        fromMax: formatEther(fromMax),
        to: STABLE_TOKEN,
        toMax: aUSDAmount,
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
          kycStatus
        />
      );
    },
  });
};

const Swap: React.FC = () => {
  const { contracts } = useWeb3Store();
  const triggerContract = async () => {
    // await contracts?.permissionedExchange.createPairOrders(
    //   '0x7E65A71046170A5b1AaB5C5cC64242EDF95CaBEA',
    //   '0x15b64D7036667695Ee68D6619CEb162aEaFAdbA6',
    //   BigNumber.from(1000000),
    //   BigNumber.from('50000000000000000000'),
    //   1696550400,
    //   BigNumber.from(100000000),
    // );
    await contracts?.sqToken.increaseAllowance(
      contracts.permissionedExchange.address,
      BigNumber.from('999000000000000000000000'),
    );
  };

  return (
    <WalletRoute
      element={
        <div className={styles.swap}>
          <div className={styles.container}>
            <div className={styles.content}>
              <div className={styles.tabs}>
                <TabButtons tabs={buttonLinks} whiteTab />
              </div>
              <Routes>
                <Route index path={BUY} element={<USDCToSqt />} />
                <Route path={SELL} element={<SqtToUSDC />} />
                <Route path={'/'} element={<Navigate replace to={BUY} />} />
              </Routes>
            </div>
          </div>
          {/* <button
            onClick={() => {
              triggerContract();
            }}
          >
            Create Pair orders
          </button> */}
          <Footer simple />
        </div>
      }
    ></WalletRoute>
  );
};

export default Swap;
