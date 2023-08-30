// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { FC, ReactNode, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import { CurEra, IPFSImage } from '@components';
import { ConnectedIndexer } from '@components/IndexerDetails/IndexerName';
import NewCard from '@components/NewCard';
import { TOP_100_INDEXERS, useWeb3 } from '@containers';
import { useEra, useSortedIndexerDeployments } from '@hooks';
import { getCommission, useSortedIndexer } from '@hooks/useSortedIndexer';
import { BalanceLayout } from '@pages/dashboard';
import { RewardsLineChart } from '@pages/dashboard/components/RewardsLineChart/RewardsLineChart';
import { StakeAndDelegationLineChart } from '@pages/dashboard/components/StakeAndDelegationLineChart/StakeAndDelegationLineChart';
import { DoDelegate } from '@pages/delegator/DoDelegate';
import { DoUndelegate } from '@pages/delegator/DoUndelegate';
import { Spinner, Typography } from '@subql/components';
import { renderAsync, useGetIndexerDelegatorsQuery, useGetTopIndexersQuery } from '@subql/react-hooks';
import { notEmpty, parseError } from '@utils';
import { TOKEN } from '@utils/constants';
import { formatNumber, formatSQT, truncateToDecimalPlace } from '@utils/numberFormatters';
import { Skeleton, Tag } from 'antd';
import clsx from 'clsx';
import { t } from 'i18next';
import { isString } from 'lodash-es';

import { OwnDelegator } from '../MyDelegators/OwnDelegator';
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

const AccountBaseInfo = (props: { account: string }) => {
  const makeChunk = ({ title, value }: { title: ReactNode; value: ReactNode }) => {
    return (
      <div className="col-flex">
        <Typography variant="small">{title}</Typography>

        <div style={{ marginTop: 8 }}>
          {isString(value) ? (
            <Typography variant="text" weight={500}>
              {value}
            </Typography>
          ) : (
            value
          )}
        </div>
      </div>
    );
  };

  const topIndexers = useGetTopIndexersQuery({
    context: { clientName: TOP_100_INDEXERS },
  });

  const accountInfos = useMemo(() => {
    if (!topIndexers.data?.indexerPrograms.length) return;
    return {
      infos: topIndexers.data.indexerPrograms.find((i) => i.id === props.account),
      rank: topIndexers.data.indexerPrograms.findIndex((i) => i.id === props.account) + 1,
    };
  }, [topIndexers, props.account]);

  return (
    <div className={styles.accountBaseInfo}>
      {(accountInfos?.rank ?? 0) <= 100
        ? makeChunk({ title: 'Indexer Rank', value: `# ${accountInfos?.rank}` })
        : makeChunk({
            title: 'Score',
            value: accountInfos?.infos?.totalPoints ?? 0,
          })}

      {makeChunk({ title: 'Uptime', value: `${truncateToDecimalPlace(accountInfos?.infos?.uptime || 0, 2)}%` })}

      {makeChunk({
        title: 'Era Reward Collection',
        value: t(accountInfos?.infos?.rewardCollection === 1 ? 'general.frequent' : 'general.infrequent'),
      })}

      {makeChunk({
        title: 'SSL',
        value: (
          <Tag color="green">{accountInfos?.infos?.sslEnabled ? t('general.enabled') : t('general.disabled')}</Tag>
        ),
      })}

      {makeChunk({
        title: 'Social Credibility',
        value: (
          <div>
            <Tag color="green">
              {accountInfos?.infos?.socialCredibility ? t('general.enabled') : t('general.disabled')}
            </Tag>
          </div>
        ),
      })}
    </div>
  );
};

const ActiveCard = (props: { account: string }) => {
  const navigate = useNavigate();

  const indexerDeployments = useSortedIndexerDeployments(props.account);

  return renderAsync(indexerDeployments, {
    loading: () => <Skeleton style={{ width: 302 }}></Skeleton>,
    error: (e) => <Typography>{parseError(e)}</Typography>,
    data: () => (
      <NewCard
        title="Active Projects"
        titleExtra={
          <>
            <div style={{ fontSize: 16, display: 'flex', alignItems: 'baseline' }}>
              <Typography variant="h5" weight={500} style={{ color: 'var(--sq-blue600)', marginRight: 8 }}>
                {indexerDeployments.data?.length}
              </Typography>
              Project
            </div>

            <div style={{ visibility: 'hidden', height: 18 }}>1</div>
          </>
        }
        tooltip="The number of actively indexed projects by this indexer"
        width={302}
      >
        <>
          <div className={styles.images}>
            {indexerDeployments.data
              ?.filter(notEmpty)
              .slice(0, 9)
              .map((project) => (
                <IPFSImage
                  key={project.id}
                  src={project.projectMeta.image || '/static/default.project.png'}
                  className={styles.image}
                  onClick={() => {
                    navigate(`/explorer/project/${project.id}`);
                  }}
                />
              ))}
          </div>
        </>
      </NewCard>
    ),
  });
};

const IndexerProfile: FC = () => {
  const { id: account } = useParams();
  const { currentEra } = useEra();
  const sortedIndexer = useSortedIndexer(account || '');
  const indexerDelegators = useGetIndexerDelegatorsQuery({ variables: { id: account ?? '', offset: 0 } });
  const result = useQuery(
    gql`
      query MyQuery($indexerId: String!) {
        eraRewards(filter: { indexerId: { equalTo: $indexerId } }) {
          aggregates {
            sum {
              amount
            }
          }
        }

        delegatorEraRewards: eraRewards(filter: { indexerId: { equalTo: $indexerId }, isIndexer: { equalTo: false } }) {
          aggregates {
            sum {
              amount
            }
          }
        }

        indexer(id: $indexerId) {
          commission
        }
        indexerStakes(filter: { id: { includes: $indexerId } }) {
          aggregates {
            sum {
              delegatorStake
              indexerStake
              totalStake
            }
          }
        }
      }
    `,
    {
      variables: {
        indexerId: account,
      },
    },
  );

  return renderAsync(result, {
    loading: () => <Spinner></Spinner>,
    error: (e) => <Typography>{parseError(e)}</Typography>,
    data: (fetchedResult) => {
      if (!sortedIndexer.data) return <>Something Wrong Please refresh the page</>;

      return (
        <div className={styles.indexerProfile}>
          <div className="col-flex">
            <AccountHeader account={account ?? ''} />

            <AccountBaseInfo account={account ?? ''}></AccountBaseInfo>

            <div className="flex-between" style={{ margin: '24px 0' }}>
              <NewCard
                title="Total Rewards"
                titleExtra={BalanceLayout({
                  mainBalance: formatSQT(fetchedResult.eraRewards.aggregates.sum.amount),
                })}
                tooltip="This is the total rewards that have been claimed or are able to be claimed by this indexer right now"
                width={302}
              >
                <div className="col-flex">
                  <div className={clsx(styles.cardContentLine, 'flex-between')}>
                    <Typography variant="small" type="secondary">
                      Current Commission Rate
                    </Typography>
                    <Typography variant="small">
                      {getCommission(fetchedResult.indexer.commission, currentEra.data?.index).current} %
                    </Typography>
                  </div>

                  <div className={clsx(styles.cardContentLine, 'flex-between')}>
                    <Typography variant="small" type="secondary">
                      Total Rewards to Delegators
                    </Typography>
                    <Typography variant="small">
                      {formatNumber(formatSQT(fetchedResult.delegatorEraRewards.aggregates.sum.amount))} {TOKEN}
                    </Typography>
                  </div>
                </div>
              </NewCard>

              <NewCard
                title="Current Total Stake"
                titleExtra={BalanceLayout({
                  mainBalance: sortedIndexer.data.totalStake.current,
                  secondaryBalance: sortedIndexer.data.totalStake.after,
                })}
                tooltip={`This is the total staked ${TOKEN} by this indexer. This includes ${TOKEN} that has been delegated to this Indexer`}
                width={302}
              >
                <div className="col-flex">
                  <div className={clsx(styles.cardContentLine, 'flex-between')}>
                    <Typography variant="small" type="secondary">
                      Own Stake
                    </Typography>
                    <Typography variant="small">
                      {formatNumber(sortedIndexer.data.ownStake.current)} {TOKEN}
                    </Typography>
                  </div>

                  {sortedIndexer.data.ownStake.after && (
                    <div className={clsx(styles.cardContentLine, 'flex-between')}>
                      <Typography variant="small" style={{ visibility: 'hidden' }}>
                        bigo
                      </Typography>
                      <Typography
                        variant="small"
                        type="secondary"
                        style={{ transform: 'scale(0.83333) translateX(7px)', marginLeft: 3 }}
                      >
                        {formatNumber(sortedIndexer.data.ownStake.after)} {TOKEN}
                      </Typography>
                    </div>
                  )}
                </div>
              </NewCard>

              <NewCard
                title="Current Total Delegation"
                titleExtra={BalanceLayout({
                  mainBalance: sortedIndexer.data.totalDelegations.current,
                  secondaryBalance: sortedIndexer.data.totalDelegations.after,
                })}
                tooltip={`This is the total ${TOKEN} delegated by participants to this Indexer right now.`}
                width={302}
              >
                <div className="col-flex">
                  <div className={clsx(styles.cardContentLine, 'flex-between')}>
                    <Typography variant="small" type="secondary">
                      Remaining Capacity
                    </Typography>
                    <Typography variant="small">
                      {formatNumber(sortedIndexer.data.capacity.current)} {TOKEN}
                    </Typography>
                  </div>

                  <div className={clsx(styles.cardContentLine, 'flex-between')}>
                    <Typography variant="small" type="secondary">
                      Number of Delegators
                    </Typography>
                    <Typography variant="small">{indexerDelegators.data?.indexer?.delegations.totalCount}</Typography>
                  </div>
                </div>
              </NewCard>

              <ActiveCard account={account || ''}></ActiveCard>
            </div>

            <StakeAndDelegationLineChart
              account={account}
              title="Stake"
              dataDimensionsName={['Own Stake', 'Delegation']}
            />

            <div style={{ marginTop: 24 }}>
              <RewardsLineChart
                account={account}
                title="Rewards"
                dataDimensionsName={['Indexer Rewards', 'Delegator Rewards']}
              ></RewardsLineChart>
            </div>

            <div className={styles.indexerDelegator}>
              <OwnDelegator indexer={account || ''} showHeader></OwnDelegator>
            </div>
          </div>
        </div>
      );
    },
  });
};
export default IndexerProfile;
