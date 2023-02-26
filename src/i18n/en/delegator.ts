// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { TOKEN } from '@utils/constants';

const translation = {
  delegator: 'Delegator',
  delegate: {
    title: 'Delegate',
    delegating: 'Delegating',
    to: 'To',
    from: 'From',
    redelegate: 'You can delegate from wallet or choose an indexer to redelegate from',
    delegationAmountTitle: 'You are delegating',
    amount: 'Delegation amount',
    delegator: 'Delegator',
    currentEra: 'Current Era',
    nextEra: 'Next Era',
    undelegate: 'Undelegate',
    enterAmount: 'Enter Amount',
    delegateValidNextEra: 'Once confirm, your tokens will be delegated from next era.',
    delegateAmount: 'Delegation amount',
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
    none: 'No delegator available',
    viewProfile: 'View indexer profile',
    totalAmount: 'You have {{count}} current delegation',
    totalAmount_other: 'You have {{count}} current delegations',
    invalidDelegateBeforeRewardCollect: `This indexer cannot be delegated to until they collect all the early era's rewards. Please contact the indexer to resolve the issue.`,
    invalidUndelegateBeforeRewardCollect: `This indexer cannot be undelegated from until they collect all the early era's rewards. Please contact the indexer to resolve the issue.`,
    nonToUndelegate: `There is 0 ${TOKEN} delegating for next era.`,
    delegationDesc:
      'View all Indexers you have delegated your kSQT tokens to. In return for delegating, you will earn rewards in kSQT from the rewards pool.',
  },

  withdrawals: {
    unlockedAsset: 'You can withdraw {{count}} unlocked asset.',
    unlockedAsset_other: 'You can withdraw {{count}} unlocked assets.',
    amount: 'amount',
    startAt: 'start at',
    lockedUntil: 'locked until',
    status: 'status',
    locked: 'Locked',
    unlocked: 'Unlocked',
    noWithdrawals: 'No withdrawals available.',
    withdrawToken: 'Withdraw all unlocked assets',
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
};

export default translation;
