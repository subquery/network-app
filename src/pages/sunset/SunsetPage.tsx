import React from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { WithdrawalStatus } from '@subql/network-query';
import {
  formatSQT,
  useGetDelegatorTotalAndLastEraDistictiveRewardsByIndexerQuery,
  useGetDeploymentBoosterProjectsAndTotalByConsumerQuery,
  useGetEraRewardsByIndexerAndPageLazyQuery,
  useGetFilteredDelegationsQuery,
  useGetRewardsQuery,
  useGetSpecifyDelegatorsIndexerApyQuery,
  useGetTotalRewardsAndUnclaimRewardsQuery,
  useGetWithdrawlsQuery,
} from '@subql/react-hooks';
import { cidToBytes32, formatEther, notEmpty, TOKEN } from '@utils';
import { Button } from 'antd';
import BigNumberJs from 'bignumber.js';
import dayjs from 'dayjs';
import { BigNumber } from 'ethers';
import { parseEther } from 'ethers/lib/utils';
import { Bell, ChevronDown, Clock, ExternalLink, Github, Info, Mail, Twitter, Wallet, Youtube } from 'lucide-react';

import { useWeb3Store } from 'src/stores';

import { BillingExchangeModal } from '../../components/BillingTransferModal';
import { DeploymentMeta } from '../../components/DeploymentInfo';
import DoAllocate from '../../components/DoAllocate/DoAllocate';
import DoBooster from '../../components/DoBooster';
import TransactionModal from '../../components/TransactionModal';
import { useSQToken } from '../../containers';
import { useAccount } from '../../containers/Web3';
import { useAsyncMemo, useEra, useIsIndexer, useLockPeriod, useSortedIndexerDeployments } from '../../hooks';
import { useConsumerHostServices } from '../../hooks/useConsumerHostServices';
import { mapEraValue, parseRawEraValue } from '../../hooks/useEraValue';
import { ClaimRewards, ClaimRewardsForStake } from '../account/Rewards/ClaimRewards';
import { DoWithdraw } from '../account/Withdrawn/Locked/DoWithdraw/DoWithdraw';
import { DoUndelegate } from '../delegator/DoUndelegate/DoUndelegate';
import styles from './SunsetPage.module.css';

type StatusVariant = 'success' | 'info' | 'neutral' | 'locked' | 'pending';
type RoleType = 'operator' | 'delegator' | 'consumer';

type SummaryTile = {
  label: string;
  amount: string;
  subtitle: string;
  anchorId: string;
  muted?: boolean;
};

type RewardRow = {
  id: string;
  indexerAddress: string;
  amount: string;
  era: string;
  earned: string;
  claimed: boolean;
  isCommission?: boolean;
};

type DelegationRow = {
  indexer: string;
  value: {
    current: string;
    after?: string;
  };
  apy: string;
  commission: string;
  totalRewards: string;
  lastEraRewards: string;
  indexerActive?: boolean;
  lastDelegationEra: number;
};

type WithdrawalRow = {
  index: string;
  amount: string;
  type: string;
  startTime: string;
  endAt: string;
  lockStatus: 'locked' | 'unlocked';
  indexer: string;
};

const DOCS_URL = 'https://academy.subquery.network/subquery_network/kepler/welcome.html';
const INDEXER_ADMIN_URL =
  'https://academy.subquery.network/subquery_network/node_operators/setup/becoming-a-node-operator.html';
const CONTRIBUTE_URL = 'https://github.com/subquery/network-explorer';

const formatCompact = (value: string | number, digits = 2) => {
  const num = typeof value === 'number' ? value : Number(value || 0);
  if (!Number.isFinite(num)) return '0';

  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: digits,
  }).format(num);
};

const formatPlain = (value: string | number, digits = 2) => {
  const num = typeof value === 'number' ? value : Number(value || 0);
  if (!Number.isFinite(num)) return '0';

  return new Intl.NumberFormat('en', {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  }).format(num);
};

const shortenAddress = (address?: string | null) => {
  if (!address) return 'Connect wallet';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const scrollToSection = (anchorId: string) => {
  const element = document.getElementById(anchorId);
  if (!element) return;

  const targetY = element.getBoundingClientRect().top + window.scrollY - 96;
  window.scrollTo({ top: targetY, behavior: 'smooth' });
};

const RolePill: React.FC<{ role: RoleType }> = ({ role }) => {
  const roleMap: Record<RoleType, { label: string; className: string }> = {
    operator: { label: 'Operator', className: styles.roleOperator },
    delegator: { label: 'Delegator', className: styles.roleDelegator },
    consumer: { label: 'Consumer', className: styles.roleConsumer },
  };

  return <span className={`${styles.pill} ${roleMap[role].className}`}>{roleMap[role].label}</span>;
};

const StatusPill: React.FC<{ variant: StatusVariant; children: React.ReactNode }> = ({ variant, children }) => {
  const statusMap: Record<StatusVariant, string> = {
    success: styles.statusSuccess,
    info: styles.statusInfo,
    neutral: styles.statusNeutral,
    locked: styles.statusLocked,
    pending: styles.statusPending,
  };

  return <span className={`${styles.statusPill} ${statusMap[variant]}`}>{children}</span>;
};

const SubQueryLogo: React.FC = () => <img src="/static/logo.png" alt="SubQuery" className={styles.brandLogo} />;

const WalletControl: React.FC = () => {
  const { address } = useAccount();

  return (
    <ConnectButton.Custom>
      {({ account, openAccountModal, openConnectModal }) => {
        const onClick = account ? openAccountModal : openConnectModal;

        return (
          <button type="button" className={styles.walletButton} onClick={onClick}>
            <span className={styles.walletStatus} />
            <span className={styles.walletAddress}>{shortenAddress(address || account?.address)}</span>
            <ChevronDown size={14} strokeWidth={2} className={styles.walletChevron} />
          </button>
        );
      }}
    </ConnectButton.Custom>
  );
};

const CancelWithdrawalAction: React.FC<{
  id: string;
  indexer: string;
  onSuccess: () => void;
}> = ({ id, indexer, onSuccess }) => {
  const { contracts } = useWeb3Store();

  const handleClick = async () => {
    if (!contracts) throw new Error('Contracts not available');

    const pendingTx = await contracts.stakingManager.cancelUnbonding(id);
    const receipt = await pendingTx.wait();
    onSuccess();
    return receipt;
  };

  return (
    <TransactionModal
      variant="textBtn"
      text={{
        title: 'Cancel withdrawal',
        steps: ['Cancel withdrawal', 'Confirm in wallet'],
      }}
      actions={[{ label: 'Cancel', key: 'cancel' }]}
      onClick={handleClick}
      renderContent={(onSubmit, onCancel, isLoading, error) => (
        <div className={styles.modalContent}>
          <p className={styles.modalHint}>
            Cancel the pending withdrawal for <strong>{shortenAddress(indexer)}</strong> and return the stake to its
            previous staking position.
          </p>
          {error ? <p className={styles.modalError}>{String(error)}</p> : null}
          <div className={styles.modalButtons}>
            <Button onClick={onCancel}>Back</Button>
            <Button type="primary" loading={isLoading} onClick={onSubmit}>
              Confirm Cancel
            </Button>
          </div>
        </div>
      )}
    />
  );
};

const ConnectedSunsetContent: React.FC<{ account: string }> = ({ account }) => {
  const { currentEra } = useEra();
  const { contracts } = useWeb3Store();
  const isIndexer = useIsIndexer(account);
  const rewards = useGetRewardsQuery({ variables: { address: account }, fetchPolicy: 'network-only' });
  const totalRewardsSummary = useGetTotalRewardsAndUnclaimRewardsQuery({
    variables: { account },
    fetchPolicy: 'network-only',
  });
  const [fetchEraRewards, eraRewards] = useGetEraRewardsByIndexerAndPageLazyQuery();
  const [fetchUnhealthyRewards] = useLazyQuery<{
    indexers: { nodes: { active: boolean; lastClaimEra: string; id: string }[] };
  }>(gql`
    query GetUnhealthyRewards($indexerAddress: [String!]!) {
      indexers(filter: { id: { in: $indexerAddress } }) {
        nodes {
          active
          lastClaimEra
          id
        }
      }
    }
  `);

  const delegations = useGetFilteredDelegationsQuery({
    variables: { delegator: account ?? '', filterIndexer: account ?? '', offset: 0 },
    fetchPolicy: 'network-only',
  });

  const delegationApys = useGetSpecifyDelegatorsIndexerApyQuery({
    variables: {
      delegator: account ?? '',
      indexers: delegations.data?.delegations?.nodes.map((item) => item?.indexerId || '') ?? [],
      era: currentEra.data?.index ? currentEra.data.index - 1 : 0,
    },
  });

  const delegationRewards = useGetDelegatorTotalAndLastEraDistictiveRewardsByIndexerQuery({
    variables: {
      delegator: account ?? '',
      indexers: delegations.data?.delegations?.nodes.map((item) => item?.indexerId || '') ?? [],
      era: currentEra.data?.index ? currentEra.data.index - 1 : 0,
    },
  });

  const allocations = useSortedIndexerDeployments(account);
  const boostedProjects = useGetDeploymentBoosterProjectsAndTotalByConsumerQuery({
    variables: { consumer: account, first: 20, offset: 0 },
    fetchPolicy: 'network-only',
  });
  const withdrawals = useGetWithdrawlsQuery({
    variables: { delegator: account, status: WithdrawalStatus.ONGOING, offset: 0 },
    fetchPolicy: 'network-only',
  });
  const lockPeriod = useLockPeriod();
  const { balance, consumerHostBalance } = useSQToken();
  const { getChannelSpent } = useConsumerHostServices({ autoLogin: false });

  React.useEffect(() => {
    fetchEraRewards({
      variables: { offset: 0, pageSize: 100, delegatorId: account, totalCount: 0 },
      fetchPolicy: 'network-only',
    });
  }, [account, fetchEraRewards]);

  const channelSpent = useAsyncMemo(async () => {
    const res = await getChannelSpent({ consumer: account || '' });
    return res.data;
  }, [account]);

  const boostedRewards = useAsyncMemo(async () => {
    if (!contracts || !boostedProjects.data?.deploymentBoosterSummaries?.nodes?.length)
      return new Map<string, string>();

    const entries = await Promise.all(
      boostedProjects.data.deploymentBoosterSummaries.nodes
        .filter((item) => notEmpty(item) && !BigNumberJs(item.totalAmount?.toString() || '0').isZero())
        .map(async (item) => {
          try {
            const reward = await contracts.rewardsBooster.getAccQueryRewardsByType(
              cidToBytes32(item.deploymentId),
              account,
            );
            return [item.deploymentId, reward.toString()] as const;
          } catch {
            return [item.deploymentId, '0'] as const;
          }
        }),
    );

    return new Map(entries);
  }, [contracts, boostedProjects.data, account]);

  const boostedRows = React.useMemo(() => {
    return (
      boostedProjects.data?.deploymentBoosterSummaries?.nodes.filter(
        (item) => notEmpty(item) && !BigNumberJs(item.totalAmount?.toString() || '0').isZero(),
      ) || []
    );
  }, [boostedProjects.data]);

  const unclaimedIndexers = React.useMemo(() => {
    return (
      rewards.data?.unclaimedRewards?.nodes
        ?.map((item) => item?.indexerAddress)
        .filter((item): item is string => Boolean(item)) ?? []
    );
  }, [rewards.data]);

  const unhealthyIndexers = useAsyncMemo(async () => {
    if (!unclaimedIndexers.length || !currentEra.data?.index) {
      return { unregisteredIndexers: [], unclaimedIndexers: [] };
    }

    const result = await fetchUnhealthyRewards({ variables: { indexerAddress: unclaimedIndexers } });
    const nodes = result.data?.indexers.nodes ?? [];

    return {
      unregisteredIndexers: nodes.filter((item) => !item.active),
      unclaimedIndexers: nodes.filter((item) => item.lastClaimEra !== `${(currentEra.data?.index || 1) - 1}`),
    };
  }, [fetchUnhealthyRewards, unclaimedIndexers.join(','), currentEra.data?.index]);

  const canClaimForStakeIndexers = React.useMemo(() => {
    return unclaimedIndexers.filter((item) => {
      return (
        !unhealthyIndexers.data?.unclaimedIndexers.some((bad) => bad.id === item) &&
        !unhealthyIndexers.data?.unregisteredIndexers.some((bad) => bad.id === item)
      );
    });
  }, [unclaimedIndexers, unhealthyIndexers.data]);

  const unclaimedTotal = React.useMemo(() => {
    const total = (rewards.data?.unclaimedRewards?.nodes ?? []).reduce((sum, reward) => {
      return sum.add(BigNumber.from(reward?.amount ?? '0'));
    }, BigNumber.from(0));

    return formatEther(total);
  }, [rewards.data]);

  const rewardRows = React.useMemo<RewardRow[]>(() => {
    return (eraRewards.data?.eraRewards?.nodes ?? [])
      .filter(notEmpty)
      .filter((item) => !item.claimed)
      .slice(0, 10)
      .map((item, index) => ({
        id: `${item.eraId}-${item.indexerId}-${index}`,
        indexerAddress: item.indexerId,
        amount: formatEther(item.amount),
        era: `${parseInt(item.eraId, 16)}`,
        earned: dayjs(item.createdTimestamp).format('YYYY-MM-DD HH:mm'),
        claimed: item.claimed,
        isCommission: item.isCommission,
      }));
  }, [eraRewards.data]);

  const allocationRows = React.useMemo(() => {
    return (allocations.data ?? []).filter((item) => BigNumberJs(item.allocatedAmount || '0').gt(0));
  }, [allocations.data]);

  const delegationRows = React.useMemo<DelegationRow[]>(() => {
    return (delegations.data?.delegations?.nodes ?? [])
      .filter(notEmpty)
      .map((delegation) => {
        const totalReward = delegationRewards.data?.totalRewards?.groupedAggregates?.find((item) =>
          item.keys?.includes(delegation.indexerId),
        );
        const lastEraReward = delegationRewards.data?.lastEraCollectRewards?.groupedAggregates?.find((item) =>
          item.keys?.includes(delegation.indexerId),
        );
        const rawAmount = parseRawEraValue(delegation.amount || '0', currentEra.data?.index);
        const value = mapEraValue(rawAmount, (item) => formatEther(item ?? 0));
        const commission = parseRawEraValue(delegation.indexer?.commission, currentEra.data?.index);

        return {
          indexer: delegation.indexerId,
          value: {
            current: value.current || '0',
            after: value.after || '0',
          },
          apy:
            delegationApys.data?.eraDelegatorIndexerApies?.nodes.find(
              (item) => item?.indexerId === delegation.indexerId,
            )?.apy ?? '0',
          commission: BigNumberJs(commission.current.toString()).div(10000).toFixed(2),
          totalRewards: totalReward?.sum?.reward.toString() ?? '0',
          lastEraRewards: lastEraReward?.sum?.reward.toString() ?? '0',
          indexerActive: delegation.indexer?.active,
          lastDelegationEra: (delegation.amount?.era || 0) as number,
        };
      })
      .filter((item) => parseEther(item.value.current || '0').gt('0') || parseEther(item.value.after || '0').gt('0'));
  }, [delegations.data, delegationRewards.data, delegationApys.data, currentEra.data?.index]);

  const withdrawalRows = React.useMemo<WithdrawalRow[]>(() => {
    const seconds = Number(lockPeriod.data || 0);

    return (withdrawals.data?.withdrawls?.nodes ?? [])
      .filter(notEmpty)
      .map((item, index) => {
        const endAt = dayjs.utc(item.startTime).add(seconds, 'second');
        const unlocked = dayjs.utc().isAfter(endAt);

        return {
          index: item.id || `${index}`,
          amount: formatEther(item.amount),
          type: item.type,
          startTime: item.startTime,
          endAt: endAt.local().format('YYYY-MM-DD HH:mm'),
          lockStatus: unlocked ? 'unlocked' : 'locked',
          indexer: item.indexer,
        };
      })
      .sort((a, b) => dayjs(b.endAt).unix() - dayjs(a.endAt).unix());
  }, [withdrawals.data, lockPeriod.data]);

  const unlockedWithdrawalAmount = React.useMemo(() => {
    return withdrawalRows.reduce((sum, row) => {
      return row.lockStatus === 'unlocked' ? sum.add(BigNumber.from(parseEther(row.amount).toString())) : sum;
    }, BigNumber.from(0));
  }, [withdrawalRows]);

  const totalBoosted = React.useMemo(() => {
    return boostedProjects.data?.totalBoostedAmount?.aggregates?.sum?.totalAmount?.toString() || '0';
  }, [boostedProjects.data]);

  const billingUnlocked = consumerHostBalance.result.data?.balance;
  const billingLocked = channelSpent.data?.remain;
  const walletBalance = balance.result.data;

  const rewardsTotalValue = formatSQT(totalRewardsSummary.data?.unclaimTotalRewards?.aggregates?.sum?.amount ?? '0');
  const allocationTotalValue = formatSQT(
    allocationRows.reduce(
      (sum, row) =>
        BigNumberJs(sum)
          .plus(row.allocatedAmount || '0')
          .toString(),
      '0',
    ),
  );
  const delegationTotalValue = delegationRows.reduce(
    (sum, row) =>
      BigNumberJs(sum)
        .plus(row.value.after || row.value.current || '0')
        .toString(),
    '0',
  );
  const boostsTotalValue = formatSQT(totalBoosted);
  const billingTotalValue = BigNumberJs(formatSQT(billingUnlocked?.toString() || '0'))
    .plus(formatEther(billingLocked || '0'))
    .toString();
  const withdrawalsTotalValue = withdrawalRows.reduce((sum, row) => BigNumberJs(sum).plus(row.amount).toString(), '0');
  const totalRecoverableValue = BigNumberJs(rewardsTotalValue)
    .plus(allocationTotalValue)
    .plus(delegationTotalValue)
    .plus(boostsTotalValue)
    .plus(billingTotalValue)
    .plus(withdrawalsTotalValue)
    .toString();

  const eraProgress = React.useMemo(() => {
    const start = dayjs(currentEra.data?.startTime);
    const end = dayjs(currentEra.data?.estEndTime);
    const now = dayjs();
    const total = Math.max(end.diff(start), 1);
    const elapsed = Math.min(Math.max(now.diff(start), 0), total);
    return Math.round((elapsed / total) * 100);
  }, [currentEra.data?.startTime, currentEra.data?.estEndTime]);

  const eraEndsIn = React.useMemo(() => {
    if (!currentEra.data?.estEndTime) return '--';
    const end = dayjs(currentEra.data.estEndTime);
    const now = dayjs();
    const days = Math.max(end.diff(now, 'day'), 0);
    const hours = Math.max(end.diff(now, 'hour') % 24, 0);
    const minutes = Math.max(end.diff(now, 'minute') % 60, 0);
    return `${days.toString().padStart(2, '0')}d ${hours.toString().padStart(2, '0')}h ${minutes
      .toString()
      .padStart(2, '0')}m`;
  }, [currentEra.data?.estEndTime]);

  const summaryTiles: SummaryTile[] = [
    {
      label: 'Rewards',
      amount: formatCompact(rewardsTotalValue),
      subtitle: `${rewardRows.length} unclaimed`,
      anchorId: 'section-rewards',
    },
    {
      label: 'Allocations',
      amount: formatCompact(allocationTotalValue),
      subtitle: `${allocationRows.length} projects`,
      anchorId: 'section-allocations',
    },
    {
      label: 'Delegations',
      amount: formatCompact(delegationTotalValue),
      subtitle: `${delegationRows.length} operators`,
      anchorId: 'section-delegations',
    },
    {
      label: 'Boosts',
      amount: formatCompact(boostsTotalValue),
      subtitle: `${boostedRows.length} projects`,
      anchorId: 'section-boosts',
    },
    {
      label: 'Billing',
      amount: formatCompact(billingTotalValue),
      subtitle: `${formatPlain(formatSQT(billingUnlocked?.toString() || '0'))} withdrawable`,
      anchorId: 'section-billing',
    },
    {
      label: 'Withdrawals',
      amount: formatCompact(withdrawalsTotalValue),
      subtitle: `${withdrawalRows.filter((item) => item.lockStatus === 'locked').length} locked`,
      anchorId: 'section-withdrawals',
      muted: true,
    },
  ];

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div>
          <div className={styles.eyebrow}>Profile</div>
          <h1 className={styles.pageTitle}>Recover Your SQT</h1>
          <div className={styles.subtitle}>
            <span>Wallet</span>
            <span className={styles.walletInline}>{shortenAddress(account)}</span>
            <span className={styles.dot}>·</span>
            <span>All amounts displayed in {TOKEN}</span>
          </div>
        </div>

        <div className={styles.eraCard}>
          <div className={styles.eraLabel}>
            Current Era: <span className={styles.eraValue}>{currentEra.data?.index ?? '--'}</span>
          </div>
          <div className={styles.eraMeta}>Ends in {eraEndsIn}</div>
          <div className={styles.progressRow}>
            <div className={styles.progressTrack}>
              <div className={styles.progressBar} style={{ width: `${eraProgress}%` }} />
            </div>
            <span className={styles.progressValue}>{eraProgress}%</span>
          </div>
        </div>
      </section>

      <section className={styles.summaryCard}>
        <div className={styles.summaryTotal}>
          <div className={styles.summaryLabel}>Total Recoverable</div>
          <div className={styles.summaryAmountRow}>
            <span className={styles.summaryAmount}>{formatCompact(totalRecoverableValue)}</span>
            <span className={styles.summaryUnit}>{TOKEN}</span>
          </div>
          <div className={styles.summaryNote}>Across 6 areas below</div>
        </div>

        <div className={styles.summaryGrid}>
          {summaryTiles.map((tile) => (
            <button
              key={tile.label}
              type="button"
              onClick={() => scrollToSection(tile.anchorId)}
              className={`${styles.summaryTile} ${tile.muted ? styles.summaryTileMuted : ''}`}
            >
              <div className={styles.summaryTileLabel}>{tile.label}</div>
              <div className={styles.summaryTileAmount}>{tile.amount}</div>
              <div className={styles.summaryTileSubtitle}>{tile.subtitle}</div>
            </button>
          ))}
        </div>
      </section>

      <div className={styles.sections}>
        <div id="section-rewards" className={styles.anchorOffset} />
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <div className={styles.titleRow}>
                <h2 className={styles.sectionTitle}>1. Unclaimed Rewards</h2>
              </div>
              <p className={styles.sectionDescription}>
                Rewards earned from staking and delegation. Claim to your wallet or restake to compound.
              </p>
            </div>
            <div className={styles.sectionAction}>
              <div className={styles.buttonRow}>
                {canClaimForStakeIndexers.length > 0 ? (
                  <ClaimRewardsForStake
                    indexers={canClaimForStakeIndexers}
                    unhealthyIndexers={unhealthyIndexers.data}
                    account={account}
                    totalUnclaimed={unclaimedTotal}
                    unCliamedCountByIndexer={rewards.data?.unclaimedRewards?.totalCount || 0}
                    onClaimed={() => {
                      rewards.refetch();
                      totalRewardsSummary.refetch();
                      fetchEraRewards({
                        variables: { offset: 0, pageSize: 100, delegatorId: account, totalCount: 0 },
                        fetchPolicy: 'network-only',
                      });
                    }}
                  />
                ) : null}
                {(rewards.data?.unclaimedRewards?.totalCount || 0) > 0 ? (
                  <ClaimRewards
                    indexers={unclaimedIndexers}
                    account={account}
                    totalUnclaimed={unclaimedTotal}
                    unCliamedCountByIndexer={rewards.data?.unclaimedRewards?.totalCount || 0}
                    onClaimed={() => {
                      rewards.refetch();
                      totalRewardsSummary.refetch();
                      fetchEraRewards({
                        variables: { offset: 0, pageSize: 100, delegatorId: account, totalCount: 0 },
                        fetchPolicy: 'network-only',
                      });
                    }}
                  />
                ) : (
                  <button type="button" className={styles.disabledButton}>
                    No Unclaimed Rewards
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className={styles.tableCard}>
            <div className={`${styles.tableHeader} ${styles.rewardGrid}`}>
              <div>Node Operator</div>
              <div>Amount</div>
              <div>Era</div>
              <div>Earned</div>
              <div>Status</div>
              <div className={styles.alignRight}>Action</div>
            </div>
            {rewardRows.length ? (
              rewardRows.map((reward, index) => (
                <div
                  key={reward.id}
                  className={`${styles.tableRow} ${styles.rewardGrid} ${index !== rewardRows.length - 1 ? styles.tableRowBorder : ''}`}
                >
                  <div className={styles.entityCell}>
                    <div className={`${styles.avatar} ${styles.pinkAccent}`} />
                    <div className={styles.entityMeta}>
                      <div className={styles.entityName}>{shortenAddress(reward.indexerAddress)}</div>
                      <div className={styles.entitySubtle}>{reward.indexerAddress}</div>
                    </div>
                  </div>
                  <div className={styles.cellStrong}>
                    {formatPlain(reward.amount, 4)} {TOKEN}
                  </div>
                  <div>{reward.era}</div>
                  <div className={styles.mutedCell}>{reward.earned}</div>
                  <div>
                    <StatusPill variant="info">{reward.isCommission ? 'Commission' : 'Unclaimed'}</StatusPill>
                  </div>
                  <div className={styles.alignRight}>
                    <span className={styles.mutedCell}>Claim above</span>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyRow}>No unclaimed rewards found for this wallet.</div>
            )}
          </div>
        </section>

        <div id="section-allocations" className={styles.anchorOffset} />
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <div className={styles.titleRow}>
                <h2 className={styles.sectionTitle}>2. Active Allocations</h2>
                <RolePill role="operator" />
              </div>
              <p className={styles.sectionDescription}>
                Remove allocations from your projects to free up stake for withdrawal.
              </p>
            </div>
          </div>
          <div className={styles.warningBanner}>
            <Info size={16} strokeWidth={2} className={styles.warningIcon} />
            <div className={styles.warningText}>
              Unstaking below your minimum requires unregistering in the{' '}
              <a href={INDEXER_ADMIN_URL} target="_blank" rel="noreferrer">
                Indexer Admin Portal
                <ExternalLink size={11} strokeWidth={2.5} />
              </a>
              . This page only removes per-project allocations.
            </div>
          </div>
          <div className={styles.tableCard}>
            <div className={`${styles.tableHeader} ${styles.allocationGrid}`}>
              <div>Project</div>
              <div>Status</div>
              <div>Est. APY</div>
              <div>Allocated</div>
              <div className={styles.alignRight}>Action</div>
            </div>
            {isIndexer.data && allocationRows.length ? (
              allocationRows.map((row, index) => (
                <div
                  key={row.deploymentId}
                  className={`${styles.tableRow} ${styles.allocationGrid} ${index !== allocationRows.length - 1 ? styles.tableRowBorder : ''}`}
                >
                  <div className={styles.entityCell}>
                    <div className={`${styles.avatar} ${styles.blueAccent}`} />
                    <div className={styles.entityMeta}>
                      <div className={styles.entityName}>
                        {row.projectMeta?.name || row.projectName || row.projectId}
                      </div>
                      <div className={styles.entitySubtle}>{row.deploymentId}</div>
                    </div>
                  </div>
                  <div>
                    <StatusPill variant={row.status ? 'success' : 'neutral'}>{row.status || 'Unknown'}</StatusPill>
                  </div>
                  <div>{formatPlain(0, 2)}%</div>
                  <div className={styles.cellStrong}>
                    {formatPlain(formatSQT(row.allocatedAmount || '0'))} {TOKEN}
                  </div>
                  <div className={styles.alignRight}>
                    <DoAllocate
                      deploymentId={row.deploymentId || ''}
                      projectId={row.projectId}
                      initialStatus="Remove"
                      onSuccess={() => allocations.refetch?.()}
                      actionBtn={<span className={styles.dangerLinkText}>Remove</span>}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyRow}>
                {isIndexer.data
                  ? 'No active allocations found.'
                  : 'This wallet is not currently acting as an operator.'}
              </div>
            )}
          </div>
        </section>

        <div id="section-delegations" className={styles.anchorOffset} />
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <div className={styles.titleRow}>
                <h2 className={styles.sectionTitle}>3. Active Delegations</h2>
                <RolePill role="delegator" />
              </div>
              <p className={styles.sectionDescription}>
                Total remaining delegation:{' '}
                <strong className={styles.inlineStrong}>
                  {formatPlain(delegationTotalValue)} {TOKEN}
                </strong>{' '}
                across <strong className={styles.inlineStrong}>{delegationRows.length}</strong> operators.
              </p>
            </div>
          </div>
          <div className={styles.infoBanner}>
            <Info size={16} strokeWidth={2} className={styles.infoIcon} />
            <div className={styles.infoText}>
              Undelegated tokens remain with the operator until the end of the current era, then enter a lock-up before
              they become claimable from the Withdrawals section.
            </div>
          </div>
          <div className={styles.tableCard}>
            <div className={`${styles.tableHeader} ${styles.delegationGrid}`}>
              <div>Operator</div>
              <div>Est. APY</div>
              <div>Commission</div>
              <div>Delegation</div>
              <div>Rewards</div>
              <div>Status</div>
              <div className={styles.alignRight}>Action</div>
            </div>
            {delegationRows.length ? (
              delegationRows.map((row, index) => {
                const isPending =
                  BigNumberJs(row.value.current).isZero() &&
                  !BigNumberJs(row.value.after || '0').isZero() &&
                  (currentEra.data?.index || 0) < row.lastDelegationEra + 2;

                return (
                  <div
                    key={row.indexer}
                    className={`${styles.tableRow} ${styles.delegationGrid} ${index !== delegationRows.length - 1 ? styles.tableRowBorder : ''}`}
                  >
                    <div className={styles.entityCell}>
                      <div className={`${styles.avatar} ${styles.purpleAccent}`} />
                      <div className={styles.entityMeta}>
                        <div className={styles.entityName}>{shortenAddress(row.indexer)}</div>
                        <div className={styles.entitySubtle}>{row.indexer}</div>
                      </div>
                    </div>
                    <div>
                      {BigNumberJs(formatEther(row.apy || '0'))
                        .multipliedBy(100)
                        .toFixed(2)}
                      %
                    </div>
                    <div>{row.commission}%</div>
                    <div className={styles.cellStrong}>
                      {formatPlain(row.value.after || row.value.current)} {TOKEN}
                    </div>
                    <div className={styles.mutedCell}>
                      {formatPlain(formatSQT(row.lastEraRewards || '0'))} {TOKEN}
                    </div>
                    <div>
                      <StatusPill variant={isPending ? 'pending' : row.indexerActive ? 'success' : 'neutral'}>
                        {isPending ? 'Pending' : row.indexerActive ? 'Active' : 'Inactive'}
                      </StatusPill>
                    </div>
                    <div className={styles.alignRight}>
                      <DoUndelegate indexerAddress={row.indexer} onSuccess={() => delegations.refetch()} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className={styles.emptyRow}>No active delegations found.</div>
            )}
          </div>
        </section>

        <div id="section-boosts" className={styles.anchorOffset} />
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <div className={styles.titleRow}>
                <h2 className={styles.sectionTitle}>4. Active Boosts</h2>
                <RolePill role="consumer" />
              </div>
              <p className={styles.sectionDescription}>
                Remaining boosted {TOKEN}:{' '}
                <strong className={styles.inlineStrong}>
                  {formatPlain(boostsTotalValue)} {TOKEN}
                </strong>{' '}
                across <strong className={styles.inlineStrong}>{boostedRows.length}</strong> projects.
              </p>
            </div>
          </div>
          <div className={styles.tableCard}>
            <div className={`${styles.tableHeader} ${styles.boostGrid}`}>
              <div>Project</div>
              <div>Boosted Amount</div>
              <div>Query Rewards</div>
              <div className={styles.alignRight}>Action</div>
            </div>
            {boostedRows.length ? (
              boostedRows.map((row, index) => (
                <div
                  key={row.deploymentId}
                  className={`${styles.tableRow} ${styles.boostGrid} ${index !== boostedRows.length - 1 ? styles.tableRowBorder : ''}`}
                >
                  <div className={styles.entityCell}>
                    <div className={`${styles.avatar} ${styles.skyAccent}`} />
                    <div className={styles.boostMetaWrap}>
                      <DeploymentMeta deploymentId={row.deploymentId} projectMetadata={row?.project?.metadata || ''} />
                    </div>
                  </div>
                  <div className={styles.cellStrong}>
                    {formatPlain(formatSQT(row.totalAmount || '0'))} {TOKEN}
                  </div>
                  <div className={styles.mutedCell}>
                    {formatPlain(formatSQT(boostedRewards.data?.get(row.deploymentId) || '0'))} {TOKEN}
                  </div>
                  <div className={styles.alignRight}>
                    <DoBooster
                      deploymentId={row.deploymentId}
                      projectId={row.projectId}
                      initAddOrRemove="remove"
                      onSuccess={() => boostedProjects.refetch()}
                      actionBtn={<span className={styles.dangerLinkText}>Remove</span>}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyRow}>No boosted projects found.</div>
            )}
          </div>
        </section>

        <div id="section-billing" className={styles.anchorOffset} />
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <div className={styles.titleRow}>
                <h2 className={styles.sectionTitle}>5. Billing Balance</h2>
                <RolePill role="consumer" />
              </div>
              <p className={styles.sectionDescription}>
                Your remaining {TOKEN} in the consumer contract. Withdraw your unlocked balance to your wallet.
              </p>
            </div>
          </div>
          <div className={styles.billingCard}>
            <div className={styles.billingGrid}>
              <div className={`${styles.billingPanel} ${styles.billingPanelHighlight}`}>
                <div className={styles.billingLabel}>Unlocked Billing</div>
                <div className={styles.billingAmountRow}>
                  <span className={styles.billingAmount}>
                    {formatPlain(formatSQT(billingUnlocked?.toString() || '0'))}
                  </span>
                  <span className={styles.summaryUnit}>{TOKEN}</span>
                </div>
                <div className={styles.billingMetaActive}>
                  <span className={styles.metaDotBlue} />
                  Withdrawable now
                </div>
              </div>

              <div className={styles.billingPanel}>
                <div className={styles.billingLabel}>Locked Billing</div>
                <div className={styles.billingAmountRow}>
                  <span className={styles.billingAmountSecondary}>
                    {formatPlain(formatEther(billingLocked || '0'))}
                  </span>
                  <span className={styles.summaryUnit}>{TOKEN}</span>
                </div>
                <div className={styles.billingMetaLocked}>
                  <span className={styles.metaDotGold} />
                  Tied to active flex plans
                </div>
              </div>

              <div className={styles.billingPanel}>
                <div className={styles.billingLabel}>
                  <Wallet size={11} strokeWidth={2} />
                  Wallet Balance
                </div>
                <div className={styles.billingAmountRow}>
                  <span className={styles.billingAmountSecondary}>
                    {formatPlain(formatEther(walletBalance || '0'))}
                  </span>
                  <span className={styles.summaryUnit}>{TOKEN}</span>
                </div>
                <div className={styles.billingMeta}>Current wallet — reference only</div>
              </div>
            </div>
            <div className={styles.billingFooter}>
              <div className={styles.billingFooterText}>
                Withdraw your unlocked balance directly to{' '}
                <span className={styles.inlineStrong}>{shortenAddress(account)}</span>.
              </div>
              <div className={styles.buttonRow}>
                <BillingExchangeModal action="Transfer" />
                <BillingExchangeModal action="Withdraw" />
              </div>
            </div>
          </div>
        </section>

        <div id="section-withdrawals" className={styles.anchorOffset} />
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <div className={styles.titleRow}>
                <h2 className={styles.sectionTitle}>6. Withdrawals</h2>
              </div>
              <p className={styles.sectionDescription}>
                {TOKEN} from previous unstakes, undelegations, and claimed commissions. Claim to your wallet once
                unlocked.
              </p>
            </div>
            <div className={styles.sectionAction}>
              <DoWithdraw
                unlockedAmount={formatEther(unlockedWithdrawalAmount)}
                disabled={unlockedWithdrawalAmount.isZero()}
                onSuccess={() => withdrawals.refetch()}
              />
            </div>
          </div>
          <div className={styles.tableCard}>
            <div className={`${styles.tableHeader} ${styles.withdrawGrid}`}>
              <div>Amount</div>
              <div>Source</div>
              <div>Unlock</div>
              <div>Status</div>
              <div className={styles.alignRight}>Action</div>
            </div>
            {withdrawalRows.length ? (
              withdrawalRows.map((row, index) => (
                <div
                  key={row.index}
                  className={`${styles.tableRow} ${styles.withdrawGrid} ${index !== withdrawalRows.length - 1 ? styles.tableRowBorder : ''}`}
                >
                  <div className={styles.cellStrong}>
                    {formatPlain(row.amount, 4)} {TOKEN}
                  </div>
                  <div>
                    <StatusPill variant="neutral">{row.type}</StatusPill>
                  </div>
                  <div className={styles.unlockCell}>
                    <Clock size={13} strokeWidth={2} />
                    <span>{row.endAt}</span>
                  </div>
                  <div>
                    <StatusPill variant={row.lockStatus === 'locked' ? 'locked' : 'success'}>
                      {row.lockStatus === 'locked' ? 'Locked' : 'Unlocked'}
                    </StatusPill>
                  </div>
                  <div className={styles.alignRight}>
                    {row.lockStatus === 'locked' ? (
                      <CancelWithdrawalAction
                        id={row.index}
                        indexer={row.indexer}
                        onSuccess={() => withdrawals.refetch()}
                      />
                    ) : (
                      <span className={styles.mutedCell}>Claim above</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyRow}>No pending withdrawals found.</div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
};

const DisconnectedSunsetContent: React.FC = () => {
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div>
          <div className={styles.eyebrow}>Profile</div>
          <h1 className={styles.pageTitle}>Recover Your SQT</h1>
          <div className={styles.subtitle}>
            <span>Connect your wallet to load your rewards, delegations, billing, and withdrawal state.</span>
          </div>
        </div>
      </section>

      <section className={styles.connectPanel}>
        <h2 className={styles.connectTitle}>Wallet Connection Required</h2>
        <p className={styles.connectText}>
          This retirement page now uses the existing SubQuery Network logic from the original app. Once you connect, the
          sections below will populate with your live allocations, rewards, boosts, billing balance, and withdrawals.
        </p>
        <ConnectButton />
      </section>
    </main>
  );
};

export const SunsetPage: React.FC = () => {
  const { address, isConnected } = useAccount();

  return (
    <div className={styles.page}>
      <header className={styles.topNav}>
        <div className={styles.brand}>
          <SubQueryLogo />
        </div>

        <nav className={styles.navLinks}>
          <a href="/" className={styles.activeNavLink}>
            Withdraw
          </a>
          <a href={DOCS_URL} className={styles.navLink} target="_blank" rel="noreferrer">
            Docs
          </a>
          <button type="button" className={styles.iconButton} aria-label="Notifications">
            <Bell size={16} strokeWidth={1.75} />
            <span className={styles.notificationDot} />
          </button>
          <WalletControl />
        </nav>
      </header>

      <div className={styles.banner}>
        <Info size={16} strokeWidth={2} className={styles.bannerIcon} />
        <p className={styles.bannerText}>
          <strong>SubQuery Network is sunsetting.</strong> Remove your allocations, claim your rewards, and withdraw
          your {TOKEN} to your wallet. The app will remain live for as long as needed to complete withdrawals.
        </p>
        <a href={DOCS_URL} className={styles.bannerLink} target="_blank" rel="noreferrer">
          Learn more
          <ExternalLink size={13} strokeWidth={2} />
        </a>
      </div>

      {isConnected && address ? <ConnectedSunsetContent account={address} /> : <DisconnectedSunsetContent />}

      <footer className={styles.footer}>
        <div className={styles.footerIcons}>
          <a href="mailto:hello@subquery.network" aria-label="Email">
            <Mail size={16} strokeWidth={1.75} />
          </a>
          <a href="https://x.com/subquerynetwork" aria-label="X" target="_blank" rel="noreferrer">
            <Twitter size={16} strokeWidth={1.75} />
          </a>
          <a href={CONTRIBUTE_URL} aria-label="GitHub" target="_blank" rel="noreferrer">
            <Github size={16} strokeWidth={1.75} />
          </a>
          <a href="https://www.youtube.com/@subquerynetwork" aria-label="YouTube" target="_blank" rel="noreferrer">
            <Youtube size={16} strokeWidth={1.75} />
          </a>
        </div>
        <div className={styles.footerText}>
          SubQuery © 2026 ·{' '}
          <a href={CONTRIBUTE_URL} target="_blank" rel="noreferrer">
            Contribute
          </a>
        </div>
      </footer>
    </div>
  );
};
