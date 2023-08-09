// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from 'react';
import { BsChatLeftDots } from 'react-icons/bs';
import { useNavigate } from 'react-router';
import { CurEra } from '@components';
import LineCharts from '@components/LineCharts';
import NewCard from '@components/NewCard';
import { Typography } from '@subql/components';
import { TOKEN } from '@utils';
import formatNumber from '@utils/formatNumber';
import Link from 'antd/es/typography/Link';
import clsx from 'clsx';

import styles from './index.module.less';

const BalanceLayout = ({
  mainBalance,
  secondaryBalance,
  token = TOKEN,
}: {
  mainBalance: number;
  secondaryBalance: number;
  token?: string;
}) => {
  return (
    <div className="col-flex">
      <div style={{ display: 'flex', alignItems: 'baseline', fontSize: 16 }}>
        <Typography variant="h5" weight={500} style={{ color: 'var(--sq-blue600)', marginRight: 8 }}>
          {formatNumber(mainBalance)}
        </Typography>
        {token}
      </div>

      <Typography variant="small" type="secondary">
        {formatNumber(secondaryBalance)} {token}
      </Typography>
    </div>
  );
};

const Dashboard: FC = (props) => {
  const navigate = useNavigate();

  return (
    <div className={styles.dashboard}>
      {/* layout:
        top
        bottom: { left => right }
      */}
      <Typography variant="h4" weight={600}>
        👋 Welcome to SubQuery Network
      </Typography>

      <div className={styles.dashboardMain}>
        <div className={styles.dashboardMainTop}>
          <NewCard
            title="Total Network Rewards"
            titleExtra={BalanceLayout({ mainBalance: 299999, secondaryBalance: 29999 })}
            tooltip="This is the total rewards that have been claimed or are able to be claimed across the entire network right now"
            width={302}
          >
            <div className="col-flex">
              <div className={clsx(styles.cardContentLine, 'flex-between')}>
                <Typography variant="small" type="secondary">
                  Total Reward to Indexers
                </Typography>
                <Typography variant="small">
                  {formatNumber(28888)} {TOKEN}
                </Typography>
              </div>

              <div className={clsx(styles.cardContentLine, 'flex-between')}>
                <Typography variant="small" type="secondary">
                  Total Reward to Delegation
                </Typography>
                <Typography variant="small">
                  {formatNumber(28888)} {TOKEN}
                </Typography>
              </div>
            </div>
          </NewCard>

          <NewCard
            title="Current Network Stake"
            titleExtra={BalanceLayout({ mainBalance: 299999, secondaryBalance: 29999 })}
            tooltip="This is the total staked SQT across the entire network right now. This includes SQT that has been delegated to Indexers"
            width={302}
          >
            <div className="col-flex">
              <div className={clsx(styles.cardContentLine, 'flex-between')}>
                <Typography variant="small" type="secondary">
                  Number of Indexers
                </Typography>
                <Typography variant="small">50</Typography>
              </div>

              <div className={clsx(styles.cardContentLine, 'flex-between')}>
                <Link
                  onClick={() => {
                    navigate('/delegator/indexers/all');
                  }}
                >
                  View Indexers
                </Link>
              </div>
            </div>
          </NewCard>

          <NewCard
            title="Current Network Delegation"
            titleExtra={BalanceLayout({ mainBalance: 299999, secondaryBalance: 29999 })}
            tooltip="This is the total SQT delegated by participants to any Indexer across the entire network right now"
            width={302}
          >
            <div className="col-flex">
              <div className={clsx(styles.cardContentLine, 'flex-between')}>
                <Typography variant="small" type="secondary">
                  Number of Delegators
                </Typography>
                <Typography variant="small">300</Typography>
              </div>

              <div className={clsx(styles.cardContentLine, 'flex-between')}>
                <Link
                  onClick={() => {
                    navigate('/delegator/indexers/top');
                  }}
                >
                  Delegate Now
                </Link>
              </div>
            </div>
          </NewCard>

          <NewCard
            title="Circulating Supply"
            titleExtra={BalanceLayout({ mainBalance: 299999, secondaryBalance: 29999 })}
            tooltip="This is the total circulating supply of SQT across the entire network right now"
            width={302}
          >
            <div className="col-flex">
              <div className={clsx(styles.cardContentLine, 'flex-between')}>
                <Typography variant="small" type="secondary">
                  Percentage Staked
                </Typography>
                <Typography variant="small">88%</Typography>
              </div>
            </div>
          </NewCard>
        </div>
        <div className={styles.dashboardMainBottom}>
          <div className={styles.dashboardMainBottomLeft}>
            <LineCharts
              title="Network Staking and Delegation"
              dataDimensionsName={['Staking', 'Delegation']}
              data={[[820, 932, 901, 934, 1290, 1330, 1320]]}
            ></LineCharts>

            <div style={{ marginTop: 24 }}>
              <LineCharts
                title="Network Rewards"
                dataDimensionsName={['Indexer Rewards', 'Delegation Rewards']}
                data={[[820, 932, 901, 934, 1290, 1330, 1320]]}
              ></LineCharts>
            </div>
          </div>
          <div className={styles.dashboardMainBottomRight}>
            <NewCard title="Current Era" titleExtra={<CurEra />} tooltip="1 era = 1 hour" width={302}></NewCard>
            <NewCard
              title="Active Projects"
              titleExtra={
                <div style={{ fontSize: 16, display: 'flex', alignItems: 'baseline' }}>
                  <Typography variant="h5" weight={500} style={{ color: 'var(--sq-blue600)', marginRight: 8 }}>
                    7
                  </Typography>
                  Project
                </div>
              }
              tooltip="The number of actively indexed projects across the entire network"
              width={302}
              style={{ marginTop: 24 }}
            >
              <>
                <div>
                  <img src="" alt="" />
                </div>
                <div>
                  <Link
                    onClick={() => {
                      navigate('/explorer/home');
                    }}
                  >
                    View All Projects
                  </Link>
                </div>
              </>
            </NewCard>

            <NewCard
              title={
                <Typography style={{ display: 'flex', alignItems: 'flex-end' }}>
                  Forum
                  <BsChatLeftDots style={{ fontSize: 20, color: 'var(--sq-blue600)', marginLeft: 10 }}></BsChatLeftDots>
                </Typography>
              }
              width={302}
              style={{ marginTop: 24 }}
            >
              <Link href="https://forum.subquery.network/c/kepler-network/16">View Forum</Link>
            </NewCard>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
