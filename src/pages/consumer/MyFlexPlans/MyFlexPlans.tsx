// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BsInfoCircle } from 'react-icons/bs';
import { IoWarning } from 'react-icons/io5';
import { Navigate, Route, Routes, useMatch, useNavigate } from 'react-router';
import { AppPageHeader } from '@components/AppPageHeader';
import { TabButtons } from '@components/TabButton';
import { WalletRoute } from '@components/WalletRoute';
import { useAccount } from '@containers/Web3';
import { useAsyncMemo, useRouteQuery } from '@hooks';
import { useConsumerHostServices } from '@hooks/useConsumerHostServices';
import { useIsLogin } from '@hooks/useIsLogin';
import { Spinner, SubqlCard, Typography } from '@subql/components';
import { formatNumberWithLocale, formatSQT } from '@utils';
import { Breadcrumb, Tooltip } from 'antd';
import BigNumberJs from 'bignumber.js';
import dayjs from 'dayjs';
import i18next from 'i18next';

import { useSQToken } from '../../../containers';
import { formatEther, TOKEN } from '../../../utils';
import { ROUTES } from '../../../utils';
import MyHostedPlan from './MyHostedPlan/MyHostedPlan';
import ApiKeys from './apiKeys';
import { BillingAction } from './BillingAction';
import styles from './MyFlexPlans.module.css';
import { MyFlexPlanTable } from './MyFlexPlanTable';

const { ONGOING_PLANS, API_KEY } = ROUTES;

const buttonLinks = [
  { label: i18next.t('myFlexPlans.ongoing'), link: ONGOING_PLANS },
  { label: i18next.t('myFlexPlans.apiKey'), link: API_KEY },
];

const BalanceCards = () => {
  const { t } = useTranslation();
  const { account } = useAccount();
  const { balance, consumerHostBalance } = useSQToken();
  const { loading: loadingBalance, data: balanceData } = useMemo(() => balance.result, [balance.result]);
  const { loading: loadingBillingBalance, data: billingBalanceData } = useMemo(
    () => consumerHostBalance.result,
    [consumerHostBalance.result],
  );
  const [billBalance] = useMemo(() => billingBalanceData ?? [], [billingBalanceData]);

  const { getChannelSpent, getUserQueriesAggregation } = useConsumerHostServices({
    autoLogin: false,
  });

  const channelSpent = useAsyncMemo(async () => {
    const res = await getChannelSpent({
      consumer: account || '',
    });

    return res.data;
  }, [account]);

  const spentInfo = useAsyncMemo(async () => {
    const res = await getUserQueriesAggregation({
      user_list: [account?.toLowerCase() || ''],
      start: dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
      end: dayjs().format('YYYY-MM-DD'),
    });

    return res.data?.[0];
  }, [account]);

  const minDeposit = useMemo(() => {
    return 400;
  }, []);

  const warnDeposit = useMemo(() => {
    if (!loadingBillingBalance) {
      if (
        !BigNumberJs(formatSQT(billBalance?.toString() || '0')).isZero() &&
        BigNumberJs(formatSQT(billBalance?.toString() || '0')).lt(minDeposit)
      ) {
        return (
          <Tooltip title="Your Billing account balance is running low. Please top up your Billing account promptly to avoid any disruption in usage.">
            <IoWarning style={{ fontSize: 16, color: 'var(--sq-error)', marginLeft: 8 }} />
          </Tooltip>
        );
      }
    }

    return '';
  }, [minDeposit, loadingBillingBalance, billBalance]);

  return (
    <div className={styles.cards}>
      <div className={styles.balances}>
        <SubqlCard
          title={
            <div className="flex" style={{ width: '100%' }}>
              <Typography>{t('flexPlans.billBalance')}</Typography>

              <Tooltip
                title={
                  <div className="col-flex" style={{ gap: 24 }}>
                    <Typography variant="medium" style={{ color: '#fff' }}>
                      When you create Flex plan, you need to deposit SQT to your billing account from your wallet.
                    </Typography>
                    <Typography variant="medium" style={{ color: '#fff' }}>
                      The funds are kept in your billing account to allow you to purchase multiple Flex plans using the
                      same funds.
                    </Typography>

                    <Typography variant="medium" style={{ color: '#fff' }}>
                      Some of your billing balance is locked in the plan, and will be unlocked shortly after plan is
                      terminated.
                    </Typography>
                  </div>
                }
              >
                <BsInfoCircle style={{ color: 'var(--sq-gray500)', fontSize: 14, marginLeft: 8 }}></BsInfoCircle>
              </Tooltip>

              <span style={{ flex: 1 }}></span>
              <BillingAction />
            </div>
          }
          titleExtra={
            <div style={{ display: 'flex', alignItems: 'baseline', fontSize: 16 }}>
              {loadingBillingBalance ? (
                <div style={{ marginRight: 8, lineHeight: '36px' }}>
                  <Spinner size={12}></Spinner>
                </div>
              ) : (
                <Typography variant="h5" weight={500} style={{ color: 'var(--sq-blue600)', marginRight: 8 }}>
                  {formatNumberWithLocale(formatSQT(billBalance?.toString() || '0'))}
                </Typography>
              )}
              {TOKEN}

              {warnDeposit}
            </div>
          }
          style={{
            width: 360,
          }}
        >
          <div className="col-flex" style={{ gap: 12 }}>
            <div className="flex-center">
              <Typography variant="small" type="secondary">
                Locked Billing Balance
              </Typography>
              <Tooltip
                title={
                  <Typography variant="medium" style={{ color: '#fff' }}>
                    {t('myFlexPlans.billing.lockedInfo')}
                  </Typography>
                }
              >
                <BsInfoCircle style={{ color: 'var(--sq-gray500)', fontSize: 14, marginLeft: 8 }}></BsInfoCircle>
              </Tooltip>
              <span style={{ flex: 1 }}></span>
              {channelSpent.loading ? (
                <Spinner size={10}></Spinner>
              ) : (
                <Typography variant="small" type="secondary">
                  {formatNumberWithLocale(formatEther(channelSpent.data?.remain, 4))} {TOKEN}
                </Typography>
              )}
            </div>

            <div className="flex-center">
              <Typography variant="small" type="secondary">
                Wallet Balance
              </Typography>
              <span style={{ flex: 1 }}></span>
              {loadingBalance ? (
                <Spinner size={10}></Spinner>
              ) : (
                <Typography variant="small" type="secondary">
                  {formatNumberWithLocale(formatEther(balanceData, 4))} {TOKEN}
                </Typography>
              )}
            </div>
          </div>
        </SubqlCard>

        <SubqlCard
          title={
            <div className="flex" style={{ width: '100%' }}>
              <Typography>SQT spent in past 7 days</Typography>
            </div>
          }
          titleExtra={
            <div style={{ display: 'flex', alignItems: 'baseline', fontSize: 16 }}>
              {spentInfo.loading ? (
                <div style={{ marginRight: 8, lineHeight: '36px' }}>
                  <Spinner size={12}></Spinner>
                </div>
              ) : (
                <Typography variant="h5" weight={500} style={{ color: 'var(--sq-blue600)', marginRight: 8 }}>
                  {formatNumberWithLocale(formatSQT(spentInfo.data?.info?.total?.toString() || '0'))}
                </Typography>
              )}
              {TOKEN}
            </div>
          }
          style={{
            width: 360,
          }}
        >
          <div className="col-flex">
            <div className="flex-center">
              <Typography variant="small" type="secondary">
                Today
              </Typography>
              <span style={{ flex: 1 }}></span>
              {spentInfo.loading ? (
                <Spinner size={10}></Spinner>
              ) : (
                <Typography variant="small" type="secondary">
                  {formatNumberWithLocale(formatEther(spentInfo.data?.info.today, 4))} {TOKEN}
                </Typography>
              )}
            </div>
          </div>
        </SubqlCard>
      </div>
    </div>
  );
};

const Header = () => {
  const { t } = useTranslation();
  const isLogin = useIsLogin();
  const match = useMatch(`/consumer/flex-plans/${ONGOING_PLANS}/details/:id/*`);
  const navigate = useNavigate();
  const query = useRouteQuery();

  return (
    <>
      {!match ? (
        <>
          <AppPageHeader title={t('plans.category.myFlexPlans')} desc={t('myFlexPlans.description')} />
          {isLogin && (
            <>
              <BalanceCards />
              <div className={styles.tabs}>
                <TabButtons tabs={buttonLinks} whiteTab />
              </div>
            </>
          )}
        </>
      ) : (
        <div style={{ marginTop: 14 }}>
          <Breadcrumb
            style={{ marginBottom: 50 }}
            items={[
              {
                key: 'My Flex Plans',
                title: (
                  <Typography variant="medium" type="secondary" style={{ cursor: 'pointer' }}>
                    Explorer
                  </Typography>
                ),
                onClick: () => {
                  navigate('/consumer/flex-plans/ongoing');
                },
              },
              {
                key: 'current',
                title: query.get('projectName'),
              },
            ]}
          ></Breadcrumb>
        </div>
      )}
    </>
  );
};

export const MyFlexPlans: React.FC = () => {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Header />
      <WalletRoute
        componentMode
        element={
          <Routes>
            <Route path={ONGOING_PLANS} element={<MyHostedPlan></MyHostedPlan>} />
            <Route path={`${ONGOING_PLANS}/details/:id`} element={<MyFlexPlanTable />}></Route>
            <Route path={API_KEY} element={<ApiKeys />} />
            <Route path={'/'} element={<Navigate replace to={ONGOING_PLANS} />} />
          </Routes>
        }
      ></WalletRoute>
    </div>
  );
};
