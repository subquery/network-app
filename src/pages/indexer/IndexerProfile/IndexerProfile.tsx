// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { FC, ReactNode, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import { CurEra } from '@components/CurEra';
import { EstimatedNextEraLayout } from '@components/EstimatedNextEraLayout';
import Expand from '@components/Expand/Expand';
import { ConnectedIndexer } from '@components/IndexerDetails/IndexerName';
import IPFSImage from '@components/IPFSImage';
import RpcError from '@components/RpcError';
import { TOP_100_INDEXERS, useWeb3 } from '@containers';
import { useEra, useIndexerMetadata, useSortedIndexerDeployments } from '@hooks';
import { useMinCommissionRate } from '@hooks/useMinCommissionRate';
import { getCommission, useSortedIndexer } from '@hooks/useSortedIndexer';
import { BalanceLayout } from '@pages/dashboard';
import { RewardsLineChart } from '@pages/dashboard/components/RewardsLineChart/RewardsLineChart';
import { StakeAndDelegationLineChart } from '@pages/dashboard/components/StakeAndDelegationLineChart/StakeAndDelegationLineChart';
import { DoDelegate } from '@pages/delegator/DoDelegate';
import { DoUndelegate } from '@pages/delegator/DoUndelegate';
import { Markdown, SubqlCard, Typography } from '@subql/components';
import { renderAsync, useGetDelegationQuery, useGetIndexersQuery, useGetTopIndexersQuery } from '@subql/react-hooks';
import { notEmpty, parseError } from '@utils';
import { isRPCError } from '@utils';
import { TOKEN } from '@utils/constants';
import { formatNumber, formatSQT, truncateToDecimalPlace } from '@utils/numberFormatters';
import { Skeleton, Tag } from 'antd';
import clsx from 'clsx';
import { toChecksumAddress } from 'ethereum-checksum-address';
import { constants } from 'ethers';
import { t } from 'i18next';
import { isString } from 'lodash-es';

import { OwnDelegator } from '../MyDelegators/OwnDelegator';
import styles from './index.module.less';

const AccountHeader: React.FC<{ account: string }> = ({ account }) => {
  const { account: connectedAccount } = useWeb3();
  const canDelegate = useMemo(() => connectedAccount !== account, [connectedAccount, account]);
  const delegations = useGetDelegationQuery({
    variables: {
      id: `${connectedAccount}:${account}`,
    },
  });

  const allIndexers = useGetIndexersQuery({
    variables: {
      filter: { id: { in: [account] } },
    },
  });

  return (
    <div className={`flex ${styles.indexerInfo}`} style={{ width: '100%' }}>
      <div className="flex">
        <ConnectedIndexer id={account} size="large"></ConnectedIndexer>
      </div>
      {canDelegate && (
        <div className="flex" style={{ marginLeft: 16 }}>
          <DoDelegate
            indexerAddress={account}
            delegation={delegations.data?.delegation}
            indexer={allIndexers.data?.indexers?.nodes[0]}
          />
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
      <div className="col-flex flex-between">
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
      {makeChunk({ title: 'Uptime', value: `${truncateToDecimalPlace(accountInfos?.infos?.uptime || 0, 2)}%` })}

      {makeChunk({
        title: 'Era Reward Collection',
        value: t(accountInfos?.infos?.rewardCollection === 1 ? 'general.frequent' : 'general.infrequent'),
      })}

      {makeChunk({
        title: 'SSL',
        value: (
          <Tag color={accountInfos?.infos?.sslEnabled ? 'green' : 'default'}>
            {accountInfos?.infos?.sslEnabled ? t('general.enabled') : t('general.disabled')}
          </Tag>
        ),
      })}

      {makeChunk({
        title: 'Social Credibility',
        value: (
          <div>
            <Tag color={accountInfos?.infos?.socialCredibility ? 'green' : 'default'}>
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
      <SubqlCard
        className={styles.cardDetails}
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
                  key={project.projectId}
                  src={project.projectMeta.image || '/static/default.project.png'}
                  className={styles.image}
                  onClick={() => {
                    navigate(`/explorer/project/${project.projectId}`);
                  }}
                />
              ))}
          </div>
        </>
      </SubqlCard>
    ),
  });
};

const IndexerProfile: FC = () => {
  const { id: account } = useParams();
  const checksumAddress = useMemo(() => {
    return toChecksumAddress(account || constants.AddressZero);
  }, [account]);
  const { currentEra } = useEra();
  const sortedIndexer = useSortedIndexer(checksumAddress);
  const { getDisplayedCommission } = useMinCommissionRate();
  const { indexerMetadata } = useIndexerMetadata(checksumAddress || '');

  const delegatorCounts = useQuery(
    gql`
      query GetIndexerDelegatorsCount($id: String!, $offset: Int) {
        indexer(id: $id) {
          delegations(
            offset: $offset
            filter: {
              delegatorId: { notEqualTo: $id }
              or: [{ exitEra: { isNull: true } }, { exitEra: { equalTo: ${currentEra.data?.index || 0} } }]
            }
          ) {
            totalCount
          }
        }
      }
    `,
    {
      variables: { id: checksumAddress, offset: 0 },
    },
  );
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
        indexerId: checksumAddress,
      },
    },
  );

  return (
    <div className={styles.indexerProfile}>
      {isRPCError(currentEra.error) ? (
        <RpcError></RpcError>
      ) : (
        <div className="col-flex">
          <AccountHeader account={checksumAddress ?? ''} />

          <AccountBaseInfo account={checksumAddress ?? ''}></AccountBaseInfo>
          <div
            style={{
              marginTop: 24,
              border: '1px solid var(--card-boder, rgba(223, 227, 232, 0.6))',
              borderRadius: 8,
              padding: 24,
            }}
          >
            <Expand height={254}>
              <Typography variant="large" weight={600}>
                About the {indexerMetadata?.name || checksumAddress}
              </Typography>

              <Markdown.Preview>
                {indexerMetadata?.description ||
                  `${indexerMetadata?.name || checksumAddress} has not provided any information about themselves`}
              </Markdown.Preview>
            </Expand>
          </div>
          <div className={styles.cardInfos}>
            {renderAsync(result, {
              loading: () => <Skeleton active style={{ width: 302 }}></Skeleton>,
              error: (e) => <Typography>{parseError(e)}</Typography>,
              data: (fetchedResult) => (
                <SubqlCard
                  className={styles.cardDetails}
                  title="Total Rewards"
                  titleExtra={BalanceLayout({
                    mainBalance: formatSQT(fetchedResult?.eraRewards?.aggregates?.sum?.amount || '0'),
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
                        {getDisplayedCommission(
                          getCommission(fetchedResult?.indexer?.commission || 0, (currentEra.data?.index || 1) - 1)
                            .current,
                        )}{' '}
                        %
                      </Typography>
                    </div>
                    <div className={clsx(styles.cardContentLine, 'flex-between')}>
                      <Typography variant="small" style={{ visibility: 'hidden' }}>
                        bigo
                      </Typography>
                      <EstimatedNextEraLayout
                        size="small"
                        value={`${getDisplayedCommission(
                          getCommission(fetchedResult?.indexer?.commission || 0, (currentEra.data?.index || 1) - 1)
                            .after || 0,
                        )} %`}
                      ></EstimatedNextEraLayout>
                    </div>

                    <div className={clsx(styles.cardContentLine, 'flex-between')}>
                      <Typography variant="small" type="secondary">
                        Total Rewards to Delegators
                      </Typography>
                      <Typography variant="small">
                        {formatNumber(formatSQT(fetchedResult?.delegatorEraRewards?.aggregates?.sum?.amount || '0'))}{' '}
                        {TOKEN}
                      </Typography>
                    </div>
                  </div>
                </SubqlCard>
              ),
            })}

            {renderAsync(sortedIndexer, {
              loading: () => <Skeleton active style={{ width: 302 }}></Skeleton>,
              error: (e) => <Typography>{parseError(e)}</Typography>,
              data: (fetchedSortedIndexer) => (
                <SubqlCard
                  className={styles.cardDetails}
                  title="Current Total Stake"
                  titleExtra={BalanceLayout({
                    mainBalance: fetchedSortedIndexer.totalStake.current,
                    secondaryBalance: fetchedSortedIndexer.totalStake.after,
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
                        {formatNumber(fetchedSortedIndexer.ownStake.current)} {TOKEN}
                      </Typography>
                    </div>

                    {fetchedSortedIndexer.ownStake.after && (
                      <div className={clsx(styles.cardContentLine, 'flex-between')}>
                        <Typography variant="small" style={{ visibility: 'hidden' }}>
                          bigo
                        </Typography>
                        <EstimatedNextEraLayout
                          size="small"
                          value={`${formatNumber(fetchedSortedIndexer.ownStake.after)} ${TOKEN}`}
                        ></EstimatedNextEraLayout>
                      </div>
                    )}
                  </div>
                </SubqlCard>
              ),
            })}

            {renderAsync(sortedIndexer, {
              loading: () => <Skeleton active style={{ width: 302 }}></Skeleton>,
              error: (e) => <Typography>{parseError(e)}</Typography>,
              data: (fetchedSortedIndexer) => (
                <SubqlCard
                  className={styles.cardDetails}
                  title="Current Total Delegation"
                  titleExtra={BalanceLayout({
                    mainBalance: fetchedSortedIndexer.totalDelegations.current,
                    secondaryBalance: fetchedSortedIndexer.totalDelegations.after,
                  })}
                  tooltip={`This is the total ${TOKEN} delegated by participants to this Node Operator right now.`}
                  width={302}
                >
                  <div className="col-flex">
                    <div className={clsx(styles.cardContentLine, 'flex-between')}>
                      <Typography variant="small" type="secondary">
                        Remaining Capacity
                      </Typography>
                      <Typography variant="small">
                        {(fetchedSortedIndexer.capacity.after || 0) < 0
                          ? 0
                          : formatNumber(fetchedSortedIndexer.capacity.after || '0')}{' '}
                        {TOKEN}
                      </Typography>
                    </div>

                    <div className={clsx(styles.cardContentLine, 'flex-between')}>
                      <Typography variant="small" type="secondary">
                        Number of Delegators
                      </Typography>
                      <Typography variant="small">{delegatorCounts.data?.indexer?.delegations.totalCount}</Typography>
                    </div>
                  </div>
                </SubqlCard>
              ),
            })}

            <ActiveCard account={checksumAddress || ''}></ActiveCard>
          </div>

          <StakeAndDelegationLineChart
            account={checksumAddress}
            title="Stake"
            dataDimensionsName={['Own Stake', 'Delegation']}
            skeletonHeight={426}
          />

          <div style={{ marginTop: 24 }}>
            <RewardsLineChart
              account={checksumAddress}
              title="Rewards"
              dataDimensionsName={['Node Operator Rewards', 'Delegator Rewards']}
              skeletonHeight={426}
            ></RewardsLineChart>
          </div>

          <div className={styles.indexerDelegator}>
            <OwnDelegator hideCard indexer={checksumAddress || ''} showHeader></OwnDelegator>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndexerProfile;
