// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { FC, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useSortedIndexer } from '@hooks';
import { StakeAndDelegationLineChart } from '@pages/dashboard/components/StakeAndDelegationLineChart/StakeAndDelegationLineChart';
import { Spinner, Typography } from '@subql/components';
import { useGetEraDelegatorIndexersQuery } from '@subql/react-hooks';
import { formatNumber, parseError, renderAsyncArray, TOKEN } from '@utils';
import { formatSQT } from '@utils';
import { mergeAsync } from '@utils';
import Link from 'antd/es/typography/Link';
import { useAccount } from 'wagmi';

import Breakdown from './Breakdown';
import styles from './index.module.less';

const Staking: FC = () => {
  const { address } = useAccount();

  const { id: profileAccount } = useParams();
  const account = useMemo(() => profileAccount || address, [address, profileAccount]);

  const navigate = useNavigate();
  const sortedIndexer = useSortedIndexer(account || '');
  const delegateToOthersByEra = useGetEraDelegatorIndexersQuery({
    variables: {
      account: account || '',
    },
  });

  const totalStaked = useMemo(() => {
    return sortedIndexer.data?.totalStake;
  }, [sortedIndexer]);

  const totalDelegateToOthers = useMemo(() => {
    if (!delegateToOthersByEra.data?.eraDelegatorIndexers?.nodes?.[0]?.totalStake) return 0;

    return formatSQT(delegateToOthersByEra.data?.eraDelegatorIndexers?.nodes?.[0]?.totalStake);
  }, [delegateToOthersByEra]);

  return renderAsyncArray(mergeAsync({ data: [], loading: false }, delegateToOthersByEra), {
    loading: () => <Spinner></Spinner>,
    error: (e) => <Typography>{parseError(e)}</Typography>,
    empty: () => <></>,
    data: () => {
      return (
        <div className={styles.staking}>
          <div className={styles.stakingBreakdown}>
            <Typography variant="large" weight={600}>
              Breakdown
            </Typography>

            <div className="flex" style={{ marginTop: 8, justifyContent: 'center' }}>
              <Breakdown
                data={[
                  {
                    value: totalStaked?.current || 0,
                  },
                  {
                    value: totalDelegateToOthers,
                  },
                ]}
              ></Breakdown>

              <div style={{ marginLeft: 24 }}>
                <div className="col-flex">
                  <div className="flex">
                    <div
                      style={{ width: 10, height: 10, background: '#7BACE7', borderRadius: '50%', marginRight: 8 }}
                    ></div>
                    <Typography>Currently Staked to your Node Operator</Typography>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', fontSize: 16, margin: '8px 0' }}>
                    <Typography variant="h5" weight={500} style={{ color: 'var(--sq-blue600)', marginRight: 8 }}>
                      {formatNumber(totalStaked?.current || '0')}
                    </Typography>
                    {TOKEN}
                  </div>

                  <div className="flex">
                    <Typography variant="small" type="secondary">
                      {formatNumber(totalStaked?.after || '0')} {TOKEN}
                    </Typography>
                    <Link
                      onClick={() => {
                        navigate('/indexer/my-delegators');
                      }}
                      style={{ fontSize: 12, marginLeft: 24 }}
                    >
                      View Delegators
                    </Link>
                  </div>
                </div>

                <div className="col-flex" style={{ marginTop: 24 }}>
                  <div className="flex">
                    <div
                      style={{ width: 10, height: 10, background: '#C7DBF5', borderRadius: '50%', marginRight: 8 }}
                    ></div>
                    <Typography>Currently Delegated to other Node Operators</Typography>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', fontSize: 16, margin: '8px 0' }}>
                    <Typography variant="h5" weight={500} style={{ color: 'var(--sq-blue600)', marginRight: 8 }}>
                      {formatNumber(totalDelegateToOthers)}
                    </Typography>
                    {TOKEN}
                  </div>

                  <div className="flex">
                    <Typography variant="small" type="secondary">
                      {formatNumber(totalDelegateToOthers)} {TOKEN}
                    </Typography>
                    <Link
                      onClick={() => {
                        navigate('/delegator/delegating');
                      }}
                      style={{ fontSize: 12, marginLeft: 24 }}
                    >
                      View Delegation
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {account && (
            <StakeAndDelegationLineChart
              account={account}
              title="Total Staked Tokens"
              dataDimensionsName={['Staked to your Node Operator', 'Delegated to other Node Operators']}
              showDelegatedToOthers
            ></StakeAndDelegationLineChart>
          )}
        </div>
      );
    },
  });
};
export default Staking;
