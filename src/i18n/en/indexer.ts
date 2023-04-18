// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

const TOKEN = import.meta.env.VITE_TOKEN;

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
    profile: 'My Profile', // Explorer V1
    myDelegators: 'My Delegators',
    myDelegatorsDescription:
      'View the list of Delegators that are supporting you and manage your commission rate to attract even more',
    myStaking: 'My Staking',
    myPlans: 'My Plans',
    myProfile: 'My Profile',
    myPlansDescription:
      'Create and view plans for your indexing service that will be advertised to Consumers to purchase',
    myStakingDesc: `Manage the ${TOKEN} that you are staking as an Indexer to different SubQuery projects.`,
    stakingAmountTitle: 'You are staking',
    rewards: 'Rewards',
    withdrawn: 'Withdrawn',
    locked: 'Locked',
    totalStake: 'total stake',
    ownStake: 'own stake',
    commission: 'commission',
    delegated: 'delegated',
    capacity: 'capacity',
    stake: 'Stake',
    unstake: 'Unstake',
    disabledStakeBeforeRewardCollect: `You can't stake until you collect all early era's rewards. Please check the Indexer admin app to ensure the lastClaimedEra = ‘currentEra - 1’.`,
    disabledUnstakeBeforeRewardCollect: `You can't unstake until you collect all early era's rewards. Please check the Indexer admin app to ensure the lastClaimedEra = ‘currentEra - 1’.`,
    enterStakeAmount: 'Enter Staking Amount',
    confirmOnMetamask: 'Confirm On MetaMask',
    stakeValidNextEra: 'Once confirm, your tokens will be staked from next era.',
    stakeInputTitle: `Enter the amount of ${TOKEN} you want to stake`,
    confirmStake: 'Confirm Stake',
    enterUnstakeAmount: 'Enter Unstake Amount',
    maxStakeBalance: `Available stake amount: {{tokenAmount}} ${import.meta.env.VITE_TOKEN}`,
    unstakeBalanceNextEra: `Available unstake amount: {{tokenAmount}} ${import.meta.env.VITE_TOKEN}`,
    unstakeValidNextEra:
      'Tokens will be unstaked from next era. They will then be locked for {{duration}} before you can withdraw. During this period, tokens do not earn any rewards.',
    unstakeInputTitle: `Enter the amount of ${TOKEN} you want to unstake`,
    confirmUnstake: 'Confirm Unstake',
    updateCommissionRate: 'Change commission rate',
    setNewCommissionRate: 'Set new commission rate',
    disabledSetCommissionBeforeRewardClaim: `You can't change commission rate until you collect all early era's rewards. Please check the Indexer admin app to ensure the lastClaimedEra = ‘currentEra - 1’.`,
    newRateValidNext2Era: 'Once confirmed, the new commission rate will take 2 full eras to take effect.',
    enterCommissionRate: 'Enter the commission rate',
    currentRate: 'Current commission rate',
    confirmRate: 'Confirm Rate',
    action: 'action',
    notRegister: 'You have not registered as an Indexer yet.',
    notRegisterDesc1:
      'An Indexer is a SubQuery network participant who is responsible for indexing blockchain data and providing this data to Consumers. ',
    notRegisterDesc2: `Indexers play a very important role within the SubQuery network. As a data-as-a-service business, an Indexer turns computational and networking power into profits.`,
    doStake: 'You haven’t staked yet. Stake to become an indexer.',
    doStakeTitle: 'Start staking now to earn as an Indexer',
    doStakeDesc:
      'In order to earn rewards from query revenue, Indexers must stake kSQT against a particular SubQuery Project that they are providing the service to.',
    learnMore: 'Learn how to become an Indexer <1>here<1>',
    topRowData: 'Top row of the data represents the data in current era.',
    secondRowData: 'Data displayed after <returnRightIcon /> means the data that will take into effect from next era.',
    here: 'here',
    amount: ' There are {{count}} indexer.',
    amount_other: ' There are {{count}} indexers.',
  },
  myProjects: {
    title: 'My Projects',
    nonProjects: `You haven’t indexed any projects yet`,
    nonProjectDesc: `Follow our documentation to help get you set up as an Indexer then head over to the Explorer to find the first project you would like to index.`,
    learnMore: 'Learn how to index a project <1>here</1>',
    description: 'All SubQuery projects you are currently indexing',
  },
  indexerPlans: {
    title: 'You haven’t created any plans yet',
    description: 'Create your first plan to advertise your indexing service to Consumers for purchase.',
    learnMore: 'Learn how to create a plan <1>here</>',
  },
  indexerOfferMarket: {
    noOffersTitle: 'There are no current offers for you to accept',
    noOffers:
      'As an Indexer, you can explore and accept offers here once they have been created by Consumers. Once accepted, the offer will appear under Service Agreements. ',
    learnMore: 'Learn Marketplace <1>here<1>',
    listDescription:
      'As an Indexer, you can explore and accept offers being advertised by Consumers which will generate service agreements',
  },
  consumerOfferMarket: {
    listDescription: 'A list of all offers published by Consumers that are available to be accepted by Indexers',
    noOffersTitle: 'There are no offers here yet',
    noOffers:
      'As a Consumer, you can go to My Offers to create your own offer which will be published on the Offer Marketplace. Indexers will accept your offer to create a service agreement and begin indexing the data for you.',
  },
  myDelegators: {
    noDelegatorsTitle: 'You don’t have any Delegators yet',
    noDelegatorsDescription:
      'Once Delegators have delegated their kSQT to you, they will appear here. First you need to register as an Indexer and begin indexing SubQuery projects, Delegators can then delegate their kSQT to you to earn rewards. Delegators are more likely to delegate their kSQT to high performing Indexers and Consumers will be attracted to Indexers with more kSQT delegated as it indicates they are reliable.',
    noDelegatorsInfoLink: 'Learn more about Delegators ',
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
    desc: 'View the top 100 ranked Indexers and all other Indexers in the SubQuery Network and delegate your kSQT tokens to earn rewards.',
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
      ownStake: `The percentage of all staked ${TOKEN} that is the Indexer’s own SQT. Higher score is better.`,
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
  allIndexers: {
    nonData: 'There is no Indexer available.',
    desc: 'View all Indexers in the SubQuery Network and delegate your kSQT tokens to earn rewards.',
  },
};

export default translation;
