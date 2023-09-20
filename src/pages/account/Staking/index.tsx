// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { FC, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useWeb3 } from '@containers';
import { useSortedIndexer } from '@hooks';
import { StakeAndDelegationLineChart } from '@pages/dashboard/components/StakeAndDelegationLineChart/StakeAndDelegationLineChart';
import { NoDelegator } from '@pages/delegator/IndexerDetails/IndexerDetails';
import { OwnDelegator } from '@pages/indexer/MyDelegators/OwnDelegator';
import { captureMessage } from '@sentry/react';
import { Spinner, Typography } from '@subql/components';
import { useGetEraQueryQuery, useGetIndexerDelegatorsQuery } from '@subql/react-hooks';
import { DeepCloneAndChangeReadonlyToMutable, formatNumber, parseError, renderAsyncArray, TOKEN } from '@utils';
import { formatSQT } from '@utils';
import { mergeAsync } from '@utils';
import Link from 'antd/es/typography/Link';
import { t } from 'i18next';

import Breakdown from './Breakdown';
import styles from './index.module.less';

const Staking: FC = () => {
  const { account } = useWeb3();

  const navigate = useNavigate();
  const indexerDelegators = useGetIndexerDelegatorsQuery({ variables: { id: account ?? '', offset: 0 } });
  const sortedIndexer = useSortedIndexer(account || '');
  const delegateToOthersByEra = useGetEraQueryQuery({
    variables: {
      account: account || '',
    },
  });
  const delegatorsRef = useRef<HTMLDivElement>(null);

  const totalCount = useMemo(() => {
    return indexerDelegators.data?.indexer?.delegations.totalCount || 0;
  }, [indexerDelegators]);

  const totalStaked = useMemo(() => {
    return sortedIndexer.data?.totalStake;
  }, [sortedIndexer]);

  const totalDelegateToOthers = useMemo(() => {
    if (!delegateToOthersByEra.data?.eraStakes?.groupedAggregates) return 0;

    const maxEraStake = DeepCloneAndChangeReadonlyToMutable(delegateToOthersByEra.data.eraStakes.groupedAggregates);
    if (maxEraStake.some((i) => !i.keys)) {
      captureMessage('Fetch era stake error, please check the graphql server');
      return 0;
    }
    maxEraStake.sort((a, b) => parseInt(b?.keys?.[0] || '', 16) - parseInt(a?.keys?.[0] || '', 16));
    if (maxEraStake.length) {
      return formatSQT(maxEraStake[0]?.sum?.stake || '');
    }

    return 0;
  }, [delegateToOthersByEra]);

  return renderAsyncArray(mergeAsync(indexerDelegators, delegateToOthersByEra), {
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
                    <Typography>Currently Staked to your Indexer</Typography>
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
                        delegatorsRef.current?.scrollIntoView();
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
                    <Typography>Currently Delegated to other Indexers</Typography>
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
              dataDimensionsName={['Staked to your Indexer', 'Delegated to other indexers']}
              showDelegatedToOthers
            ></StakeAndDelegationLineChart>
          )}

          <div className={styles.myDelegators} ref={delegatorsRef}>
            <div className={styles.delegatorHeader}>
              <Typography variant="h5">{t('indexer.myDelegators')}</Typography>
            </div>
            {totalCount <= 0 && <NoDelegator />}
            {totalCount > 0 && <OwnDelegator indexer={account ?? ''} />}
          </div>
        </div>
      );
    },
  });
};
export default Staking;
