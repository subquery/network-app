// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { BsExclamationTriangle } from 'react-icons/bs';
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
import { Footer, openNotification, Typography as SubqlTypography } from '@subql/components';
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
import { limitContract } from '@utils/limitation';
import { makeCacheKey } from '@utils/limitation';
import { Typography } from 'antd';
import { BigNumber, BigNumberish } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import i18next, { TFunction } from 'i18next';

import { useWeb3Store } from 'src/stores';

import styles from './Swap.module.less';
import { SwapForm } from './SwapForm';

const { SWAP, SELL, BUY } = ROUTES;

const buttonLinks = [
  { label: i18next.t('swap.sellkSQT'), link: `${SWAP}/${SELL}` },
  { label: i18next.t('swap.buykSQT'), link: `${SWAP}/${BUY}` },
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
  const totalLimitation = useSwapTradeLimitation();
  const [maxTradelimitation, setMaxTradeLimitation] = React.useState(0);
  const [leftTradeAmount, setLeftTradeAmount] = React.useState(0);
  const [totalTradeAmountUser, setTotalTradeAmountUser] = React.useState(0);
  const initMaxTradeLimitation = async () => {
    try {
      if (!aUSDBalance.data || !contracts || !account) return 0;
      // returned values are USDC
      const tradeLimitationPerAccount =
        (await limitContract(
          () => contracts.permissionedExchange.tradeLimitationPerAccount(),
          makeCacheKey(account, { type: 'perAccountTrade' }),
        )) || BigNumber.from(0);
      const accumulatedTrades =
        (await limitContract(
          () => contracts.permissionedExchange.accumulatedTrades(account),
          makeCacheKey(account, { type: 'accumulated' }),
        )) || BigNumber.from(0);

      const tradeLimitation = totalLimitation.data || BigNumber.from(0);

      const formatedTradeLimitation = formatUnits(tradeLimitation, STABLE_TOKEN_DECIMAL);
      const formtedTradelimitationPerAccount = formatUnits(tradeLimitationPerAccount, STABLE_TOKEN_DECIMAL);
      const formatedAccumulatedTrades = formatUnits(accumulatedTrades, STABLE_TOKEN_DECIMAL);
      setLeftTradeAmount(+formtedTradelimitationPerAccount - +formatedAccumulatedTrades);
      setTotalTradeAmountUser(+formtedTradelimitationPerAccount);
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
  }, [account, aUSDBalance.data, totalLimitation.data, contracts]);

  return { maxTradelimitation, leftTradeAmount, totalTradeAmountUser, refresh: init };
};

const USDCToSqt = () => {
  const { t } = useTranslation();
  const { account } = useWeb3();
  const [kycStatus, setKycStatus] = React.useState(false);
  const { maxTradelimitation, leftTradeAmount, totalTradeAmountUser, refresh } = useGetUSDCTradeLimitation();
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

  if (!orderId)
    return (
      <EmptyList
        title={'Swap Tool Suspended ahead of Mainnet Launch'}
        description={
          "Now that the SubQuery Mainet have been announced, we have disabled swaps of USDC.e -> kSQT and kSQT -> USDC.e. After SubQuery's TGE on the 23rd of January we will allow direct swaps of kSQT for SQT at a premium rate (1:1.83) when the network launches."
        }
      />
    );

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
          fromMax: maxTradelimitation.toString(),
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
          <>
            {!kycStatus && (
              <div
                className="flex"
                style={{ alignItems: 'flex-start', borderRadius: 8, background: 'var(--sq-gray200)', padding: 16 }}
              >
                <BsExclamationTriangle
                  style={{ color: 'var(--sq-warning)', fontSize: 16, marginRight: 16, marginTop: 3 }}
                ></BsExclamationTriangle>

                <div className="col-flex" style={{ justifyContent: 'flex-start' }}>
                  <SubqlTypography type="secondary">
                    Only participants that have been KYC’d and registered can participate in the SubQuery Kepler Swap.
                    You check if your account has been KYC'd and registered, please enter /kepler-ksqt-swap-kyc
                    &lt;your_wallet_address&gt; in the #kepler-swap-support channel in our Discord.
                  </SubqlTypography>
                  <SubqlTypography type="secondary" style={{ marginTop: 20 }}>
                    If you’re new here, check out{' '}
                    <a
                      href="https://blog.subquery.network/kepler-milestone-your-invitation-to-join/?lng=en"
                      target="_blank"
                      style={{ textDecoration: 'underline', color: 'var(--sq-gray600)' }}
                      rel="noreferrer"
                    >
                      this article
                    </a>{' '}
                    and follow the instructions on how to join.
                  </SubqlTypography>
                  <SubqlTypography type="secondary" style={{ marginTop: 20 }}>
                    If you need any help, you can reach out on the #kepler-swap-support channel in our{' '}
                    <a
                      href="https://discord.com/invite/subquery"
                      target="_blank"
                      style={{ textDecoration: 'underline', color: 'var(--sq-gray600)' }}
                      rel="noreferrer"
                    >
                      Discord
                    </a>
                    .
                  </SubqlTypography>
                </div>
              </div>
            )}
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
                refresh();
              }}
              kycStatus={kycStatus}
              lifetimeLimitationInfo={{
                isOut: leftTradeAmount === 0,
                limitation: totalTradeAmountUser,
              }}
            />
          </>
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

      const leftOrderAmount = tokens?.leftTokenGiveBalance;

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
          leftOrdersAmountInfo={{
            isOut: !!leftOrderAmount?.eq(0),
            leftOrderAmount: leftOrderAmount || BigNumber.from(0),
          }}
          kycStatus
        />
      );
    },
  });
};

const Swap: React.FC = () => {
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
                <Route path={'/'} element={<Navigate replace to={SELL} />} />
              </Routes>
            </div>
          </div>

          <Footer simple />
        </div>
      }
    ></WalletRoute>
  );
};

export default Swap;
