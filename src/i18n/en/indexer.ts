// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

const translation = {
  era: {
    currentEra: 'Current Era',
    tooltip: `1 era = {{hour}} hour`,
    tooltip_other: `1 era = {{hour}} hours`,
    timeLeft: `Ends in {{duration}}`,
    ended: 'This Era has ended',
  },
  indexer: {
    title: 'Indexer',
    indexers: 'Indexers',
    profile: 'My Profile',
    stakingAmountTitle: 'You are staking',
    rewards: 'Rewards',
    locked: 'Locked',
    totalStake: 'total stake',
    ownStake: 'own stake',
    commission: 'commission',
    delegated: 'delegated',
    capacity: 'capacity',
    stake: 'Stake',
    unstake: 'Unstake',
    disabledStakeBeforeRewardCollect: `You can't stake until you collect all early era's rewards. Please check the indexer admin app to ensure the lastClaimedEra = ‘currentEra - 1’.`,
    disabledUnstakeBeforeRewardCollect: `You can't unstake until you collect all early era's rewards. Please check the indexer admin app to ensure the lastClaimedEra = ‘currentEra - 1’.`,
    enterStakeAmount: 'Enter Staking Amount',
    confirmOnMetamask: 'Confirm On MetaMask',
    stakeValidNextEra: 'Once confirm, your tokens will be staked from next era.',
    stakeInputTitle: `Enter the amount of ${process.env.REACT_APP_TOKEN} you want to stake`,
    confirmStake: 'Confirm Stake',
    enterUnstakeAmount: 'Enter Unstake Amount',
    maxStakeBalance: 'Available stake amount: {{tokenAmount}}',
    unstakeBalanceNextEra: 'Available unstake amount: {{tokenAmount}}',
    unstakeValidNextEra:
      'Tokens will be unstaked from next era. They will then be locked for {{duration}} before you can withdraw. During this period, tokens do not earn any rewards.',
    unstakeInputTitle: `Enter the amount of ${process.env.REACT_APP_TOKEN} you want to unstake`,
    confirmUnstake: 'Confirm Unstake',
    updateCommissionRate: 'Change commission rate',
    setNewCommissionRate: 'Set new commission rate',
    disabledSetCommissionBeforeRewardClaim: `You can't change commission rate until you collect all early era's rewards. Please check the indexer admin app to ensure the lastClaimedEra = ‘currentEra - 1’.`,
    newRateValidNext2Era: 'Once confirm, the new rate will take 2 full eras to be effective.',
    enterCommissionRate: 'Enter the commission rate',
    currentRate: 'Current commission rate',
    confirmRate: 'Confirm Rate',
    action: 'action',
    notRegister: 'You haven’t registered as an indexer yet.',
    doStake: 'You haven’t staked yet. Stake to become an indexer.',
    learnMore: 'Learn how to become an indexer',
    topRowData: 'Top row of the data represents the data in current era.',
    secondRowData: 'Data displayed after <returnRightIcon /> means the data that will take into effect from next era.',
    here: 'here',
    amount: ' There are {{count}} indexer.',
    amount_other: ' There are {{count}} indexers.',
  },
  tokenApproval: {
    approve: 'Allow the SubQuery Network to use your {{token}}',
    approveToProceed: 'You must give the SubQuery Network smart contracts permission to use your {{token}}.',
    confirm: 'Approve on MetaMask',
  },
  claimIndexerRewards: {
    title: 'Collect early era’s rewards from this indexer',
    confirmToProceed: `Sign the transaction to collect all the early era’s rewards from this indexer, this transaction includes claiming the indexer’s early era’s rewards and executing the indexer’s staking changes which are blocked due to the unclaimed era rewards.

    You can undelegate your funds after the transaction is complete.`,
    confirm: 'Confirm collect',
    failureCollect: 'Sorry, collect rewards transaction has failed.',
  },
  topIndexers: {
    desc: 'View the top 100 ranked Indexers and all other indexers in the SubQuery Network and delegate your kSQT tokens to earn rewards.',
    nonData: 'There is no data to display',
    score: 'indexer score',
    uptime: 'uptime',
    ownStake: 'own stake',
    delegated: 'delegated',
    eraRewardsCollection: 'era reward collection',
    timeToUpgrade: 'time to upgrade',
    ssl: 'ssl',
    socialCredibility: 'social credibility',
    tooltip: {
      rank: 'A ranking (out of a maxium of 100) that indicates the overall performance of the Indexer. Determined based off the other factors. Higher score is better.',
      uptime:
        'Based on the health and availability of the Indexer over the last few Eras. Measures both proof of indexing and query service health checks. Higher score is better.',
      ownStake: 'The percentage of all staked SQT that is the Indexer’s own SQT. Higher score is better.',
      delegated:
        'The percentage of the Indexer’s total delegation that is the Indexer’s own SQT. Higher score is better.',
      eraRewardsCollection:
        'How fast and frequently does the Indexer collect rewards on behalf of their delegators. Frequent is better.',
      timeToUpgrade:
        'How fast Indexers upgrade their Indexer Services once a new version is released. Higher is better.',
      ssl: 'If Indexers have enabled SSL on their endpoints. Enabled is better',
      socialCredibility:
        'If Indexers have provided a ENS name pointing towards their account address. Enabled is better.',
    },
  },
};

export default translation;