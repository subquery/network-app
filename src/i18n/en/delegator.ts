// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { TOKEN } from '@utils/constants';

const translation = {
  delegator: 'Delegator',
  delegate: {
    title: 'Delegate',
    delegating: 'Delegating',
    to: 'Delegate to',
    from: 'From',
    redelegate: 'You can delegate from wallet or choose an indexer to redelegate from',
    delegationAmountTitle: 'You are delegating(Next)',
    amount: 'Delegation amount',
    delegator: 'Delegator',
    currentEra: 'Current Era',
    nextEra: 'Next Era',
    undelegate: 'Undelegate',
    enterAmount: 'Enter Amount',
    delegateValidNextEra: 'Once confirm, your tokens will be delegated from next era.',
    delegateAmount: 'Amount',
    confirmDelegate: 'Confirm Delegation',
    undelegateValidNextEra:
      'Tokens will be undelegated from next era. They will then be locked for {{duration}} before you can withdraw. During this period, tokens do not earn any rewards. ',
    undelegateAmount: `Enter the amount of ${TOKEN} you want to undelegate`,
    confirmUndelegate: 'Confirm Undelegation',
    delegateFailure: 'Sorry, the delegation has failed.',
    delegateSuccess: 'Success! Your delegation has been completed.',
    approveTokenToDelegate: 'Approve your token for staking',
    nonDelegating: `You haven’t delegated to any Indexers yet`,
    nonDelegatingDesc1: `You can participate in the SubQuery network as a Delegator by allocating your kSQT tokens to indexers of your choice.`,
    nonDelegatingDesc2: `Delegators help the network to become more transparent and secure. In return, you earn rewards in kSQT from the reward pool.`,
    yourDelegateAmount: 'Your Delegation Amount',
    none: 'No Delegator available',
    viewProfile: 'View Indexer Profile',
    totalAmount: 'You have {{count}} current delegation',
    totalAmount_other: 'You have {{count}} current delegations',
    invalidDelegateBeforeRewardCollect: `This Indexer cannot be delegated to until they collect all the early era's rewards. Please contact the indexer to resolve the issue.`,
    invalidUndelegateBeforeRewardCollect: `This Indexer cannot be undelegated from until they collect all the early era's rewards. Please contact the indexer to resolve the issue.`,
    nonToUndelegate: `There is 0 ${TOKEN} delegating for next era.`,
    delegationDesc:
      'View all Indexers you have delegated your kSQT tokens to. In return for delegating, you will earn rewards in kSQT from the rewards pool.',
    walletBalance: 'Wallet Balance: {{balance}} {{token}}',
    amountAvailable: 'Amount available for re-delegation: {{balance}} {{token}}',
    remainingCapacity: 'Remaining Delegation Capacity',
    remainingTooltip:
      'The maximum amount of tokens the Indexer can still accept before needing to deposit more of their own stake.',
    existingDelegationTooltip: 'The amount of tokens that you have already delegated to this indexer',
    existingDelegation: 'Your Existing Delegation',
    selectTooltip:
      'Select the source of the funds that you would like to delegate. This can be directly from your wallet, or by re-delegating tokens from an exisiting delegation.',
    delegateFromYourselfInfo: 'Once confirmed, your funds will be delegated to {{indexerName}} from the next era.',
    redelegateInfo:
      'Once confirmed, your funds will be re-delegated from indexer {{reIndexerName}} to {{indexerName}} from the next era.',
  },

  withdrawals: {
    headerTitle: 'Withdrawn',
    headerDesc_1:
      'View and withdraw your tokens which have been undelegated or unstaked. The tokens are locked for a short period before they become available for withdrawal.',
    headerDesc_2:
      'During the locked period you can choose to cancel the withdrawal so the tokens return to their staking/delegating position.',
    unlockedAsset: 'You can withdraw {{count}} unlocked Asset.',
    unlockedAsset_other: 'You can withdraw {{count}} unlocked Assets.',
    amount: 'amount',
    startAt: 'start at',
    type: 'type',
    lockedUntil: 'locked until',
    status: 'status',
    locked: 'Locked',
    unlocked: 'Unlocked',
    noWithdrawals: 'There are no withdrawals yet.',
    noRewards: 'There are no rewards available.',
    withdrawToken: 'Withdraw all unlocked Assets',
    withdraw: 'Withdraw',
    confirm: 'Confirm withdrawal amount',
    enterWithdrawAmount: `Enter the amount of ${TOKEN} you want to withdraw`,
    confirmWithdraw: 'Confirm Withdrawal',
    aboutToWithdraw: `You are about to withdraw {{amount}} ${TOKEN}.`,
  },

  projects: {
    deploymentId: 'Deployment ID',
    nonDeployments: 'No deployed projects available.',
  },
  rewards: {
    none: `You don't have any rewards.`,
    indexer: 'Indexer',
    amount: 'Amount',
    description:
      'View and claim your rewards earned by participating in the SubQuery Network through delegating or staking',
    action: 'Action',
    claim: {
      title: 'Claim Rewards',
      step1: 'Confirm claim',
      description: 'You are about to claim {{totalUnclaimed}} {{token}} from {{count}} indexer',
      description_other: 'You are about to claim {{totalUnclaimed}} {{token}} from {{count}} indexers',
      button: 'Claim all rewards',
      submit: 'Confirm Claim',
    },
    totalUnclaimReward: 'You have {{count}} unclaimed reward',
    totalUnclaimReward_other: 'You have {{count}} unclaimed rewards',
    claimed: 'Claimed',
    unclaimed: 'Unclaimed',
  },

  missions: {
    missions: 'Missions',
    leaderboard: 'Leaderboard',
    indexing: {},
    delegating: {},
    totalPoint: 'Total point:',
    point: 'point',
    point_other: '{{count}} points',
    participant: 'There is {{count}} {{role}}',
    participant_other: 'There are {{count}} {{role}}s',
  },
} as const;

export default translation;
