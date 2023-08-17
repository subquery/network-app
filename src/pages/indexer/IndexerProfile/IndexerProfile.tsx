// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { FC, ReactNode, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { CurEra } from '@components';
import { ConnectedIndexer } from '@components/IndexerDetails/IndexerName';
import NewCard from '@components/NewCard';
import { useWeb3 } from '@containers';
import { BalanceLayout } from '@pages/dashboard';
import { StakeAndDelegationLineChart } from '@pages/dashboard/components/StakeAndDelegationLineChart/StakeAndDelegationLineChart';
import { DoDelegate } from '@pages/delegator/DoDelegate';
import { DoUndelegate } from '@pages/delegator/DoUndelegate';
import { Typography } from '@subql/components';
import { TOKEN } from '@utils/constants';
import formatNumber, { formatSQT } from '@utils/numberFormatters';
import clsx from 'clsx';
import { isString } from 'lodash-es';

import styles from './index.module.less';

const AccountHeader: React.FC<{ account: string }> = ({ account }) => {
  const { account: connectedAccount } = useWeb3();
  const canDelegate = useMemo(() => connectedAccount !== account, [connectedAccount, account]);

  return (
    <div className="flex" style={{ width: '100%' }}>
      <div className="flex">
        <ConnectedIndexer id={account} size="large"></ConnectedIndexer>
      </div>
      {canDelegate && (
        <div className="flex" style={{ marginLeft: 16 }}>
          <DoDelegate indexerAddress={account} />
          <DoUndelegate indexerAddress={account} variant={'button'} />
        </div>
      )}

      <span style={{ flex: 1 }}></span>

      <CurEra></CurEra>
    </div>
  );
};

const AccountBaseInfo = () => {
  const makeChunk = ({ title, value }: { title: ReactNode; value: ReactNode }) => {
    return (
      <div className="col-flex">
        <Typography variant="small">{title}</Typography>
        {isString(value) ? (
          <Typography variant="text" weight={500}>
            {value}
          </Typography>
        ) : (
          value
        )}
      </div>
    );
  };
  return (
    <div className={styles.accountBaseInfo}>
      {makeChunk({ title: 'Indexer Rank', value: '#4' })}

      {makeChunk({ title: 'Uptime', value: '#4' })}

      {makeChunk({ title: 'Era Reward Collection', value: '#4' })}

      {makeChunk({ title: 'SSL', value: '#4' })}

      {makeChunk({ title: 'Social Credibility', value: '#4' })}
    </div>
  );
};

const IndexerProfile: FC = () => {
  const { id: account } = useParams();

  return (
    <div className={styles.indexerProfile}>
      {/* top to bottom */}
      <div className="col-flex">
        <AccountHeader account={account ?? ''} />

        <AccountBaseInfo></AccountBaseInfo>

        <div className="flex-between" style={{ margin: '24px 0' }}>
          <NewCard
            title="Total Network Rewards"
            titleExtra={BalanceLayout({
              mainBalance: formatSQT('9999999999'),
            })}
            tooltip="This is the total rewards that have been claimed or are able to be claimed across the entire network right now"
            width={302}
          >
            <div className="col-flex">
              <div className={clsx(styles.cardContentLine, 'flex-between')}>
                <Typography variant="small" type="secondary">
                  Total Reward to Indexers
                </Typography>
                <Typography variant="small">
                  {formatNumber(formatSQT('999999999999'))} {TOKEN}
                </Typography>
              </div>

              <div className={clsx(styles.cardContentLine, 'flex-between')}>
                <Typography variant="small" type="secondary">
                  Total Reward to Delegation
                </Typography>
                <Typography variant="small">
                  {formatNumber(formatSQT('99999999999999'))} {TOKEN}
                </Typography>
              </div>
            </div>
          </NewCard>

          <NewCard
            title="Current Total Stake"
            titleExtra={BalanceLayout({
              mainBalance: formatSQT('9999999999'),
            })}
            tooltip="This is the total rewards that have been claimed or are able to be claimed across the entire network right now"
            width={302}
          >
            <div className="col-flex">
              <div className={clsx(styles.cardContentLine, 'flex-between')}>
                <Typography variant="small" type="secondary">
                  Total Reward to Indexers
                </Typography>
                <Typography variant="small">
                  {formatNumber(formatSQT('999999999999'))} {TOKEN}
                </Typography>
              </div>

              <div className={clsx(styles.cardContentLine, 'flex-between')}>
                <Typography variant="small" type="secondary">
                  Total Reward to Delegation
                </Typography>
                <Typography variant="small">
                  {formatNumber(formatSQT('99999999999999'))} {TOKEN}
                </Typography>
              </div>
            </div>
          </NewCard>

          <NewCard
            title="Current Total Delegation"
            titleExtra={BalanceLayout({
              mainBalance: formatSQT('9999999999'),
            })}
            tooltip="This is the total rewards that have been claimed or are able to be claimed across the entire network right now"
            width={302}
          >
            <div className="col-flex">
              <div className={clsx(styles.cardContentLine, 'flex-between')}>
                <Typography variant="small" type="secondary">
                  Total Reward to Indexers
                </Typography>
                <Typography variant="small">
                  {formatNumber(formatSQT('999999999999'))} {TOKEN}
                </Typography>
              </div>

              <div className={clsx(styles.cardContentLine, 'flex-between')}>
                <Typography variant="small" type="secondary">
                  Total Reward to Delegation
                </Typography>
                <Typography variant="small">
                  {formatNumber(formatSQT('99999999999999'))} {TOKEN}
                </Typography>
              </div>
            </div>
          </NewCard>

          <NewCard
            title="Active Projects"
            titleExtra={BalanceLayout({
              mainBalance: formatSQT('9999999999'),
            })}
            tooltip="This is the total rewards that have been claimed or are able to be claimed across the entire network right now"
            width={302}
          >
            <div className="col-flex">
              <div className={clsx(styles.cardContentLine, 'flex-between')}>
                <Typography variant="small" type="secondary">
                  Total Reward to Indexers
                </Typography>
                <Typography variant="small">
                  {formatNumber(formatSQT('999999999999'))} {TOKEN}
                </Typography>
              </div>

              <div className={clsx(styles.cardContentLine, 'flex-between')}>
                <Typography variant="small" type="secondary">
                  Total Reward to Delegation
                </Typography>
                <Typography variant="small">
                  {formatNumber(formatSQT('99999999999999'))} {TOKEN}
                </Typography>
              </div>
            </div>
          </NewCard>
        </div>

        <StakeAndDelegationLineChart></StakeAndDelegationLineChart>

        <div style={{ marginTop: 24 }}>
          <StakeAndDelegationLineChart></StakeAndDelegationLineChart>
        </div>
      </div>
    </div>
  );
};
export default IndexerProfile;
