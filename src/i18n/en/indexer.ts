// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SUPPORTED_NETWORK } from '@containers/Web3';
import { TOKEN_SYMBOLS } from '@subql/network-config';

const TOKEN = TOKEN_SYMBOLS[SUPPORTED_NETWORK] ?? 'SQT';

const translation = {
  era: {
    currentEra: 'Current Era',
    tooltip: `1 era = {{hour}} hours`,
    tooltip_other: `1 era = {{hour}} hours`,
    timeLeft: `Ends in {{duration}}`,
    ended: 'This Era has ended',
  },
  indexer: {
    title: 'Node Operator',
    nickname: 'Node Operator',
    indexers: 'Node Operator',
    profile: 'My Profile', // Explorer V1
    myDelegators: 'My Delegators',
    myDelegatorsDescription:
      'View the list of Delegators that are supporting you and manage your commission rate to attract even more',
    myStaking: 'My Staking',
    myPlans: 'My Plans',
    myProfile: 'My Profile',
    myPlansDescription:
      'Create and view plans for your indexing service that will be advertised to Consumers to purchase',
    myStakingDesc: `Manage the ${TOKEN} that you are staking as a Node Operator to different SubQuery projects.`,
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
    disabledStakeBeforeRewardCollect: `You can't stake until you collect all early era's rewards. Please check the Node Operator admin app to ensure the lastClaimedEra = ‘currentEra - 1’.`,
    disabledUnstakeBeforeRewardCollect: `You can't unstake until you collect all early era's rewards. Please check the Node Operator admin app to ensure the lastClaimedEra = ‘currentEra - 1’.`,
    enterStakeAmount: 'Enter Staking Amount',
    confirmOnMetamask: 'Confirm On Wallet',
    stakeValidNextEra: 'Once confirm, your tokens will be staked from next era.',
    stakeInputTitle: `Enter the amount of ${TOKEN} you want to stake`,
    confirmStake: 'Confirm Stake',
    enterUnstakeAmount: 'Enter Unstake Amount',
    maxStakeBalance: `Available stake amount: {{tokenAmount}} ${TOKEN}`,
    unstakeBalanceNextEra: `Available unstake amount: {{tokenAmount}} ${TOKEN}`,
    unstakeValidNextEra:
      'Tokens will be unstaked from next era. They will then be locked for {{duration}} before you can withdraw. During this period, tokens do not earn any rewards.',
    unstakeInputTitle: `Enter the amount of ${TOKEN} you want to unstake`,
    confirmUnstake: 'Confirm Unstake',
    updateCommissionRate: 'Change commission rate',
    setNewCommissionRate: 'Set new commission rate',
    disabledSetCommissionBeforeRewardClaim: `You can't change commission rate until you collect all early era's rewards. Please check the Node Operator admin app to ensure the lastClaimedEra = ‘currentEra - 1’.`,
    newRateValidNext2Era: 'Once confirmed, the new commission rate will take 2 full eras to take effect.',
    enterCommissionRate: 'Enter the commission rate',
    currentRate: 'Current commission rate',
    confirmRate: 'Confirm Rate',
    action: 'action',
    notRegister: 'You have not registered as an Node Operator yet.',
    notRegisterDesc1:
      'An Node Operator is a SubQuery network participant who is responsible for indexing blockchain data and providing this data to Consumers. ',
    notRegisterDesc2: `Node Operators play a very important role within the SubQuery network. As a data-as-a-service business, an Node Operator turns computational and networking power into profits.`,
    doStake: 'You haven’t staked yet. Stake to become an Node Operator.',
    doStakeTitle: 'Start staking now to earn as an Node Operator',
    doStakeDesc:
      'In order to earn rewards from query revenue, Node Operators must stake SQT against a particular SubQuery Project that they are providing the service to.',
    learnMore: 'Learn how to become an Node Operator <1>here<1>',
    topRowData: 'Top row of the data represents the data in current era.',
    secondRowData: 'Data displayed after <returnRightIcon /> means the data that will take into effect from next era.',
    here: 'here',
    amount: ' There are {{count}} Node Operators.',
    amount_other: ' There are {{count}} Node Operators.',
    unStakeTooltip:
      'You are at the minimum staking amount so you are unable to unstake more. You can unregister your Node Operator in the Node Operator Admin app',
  },
  myProjects: {
    title: 'My Projects',
    nonProjects: `You haven’t indexed any projects yet`,
    nonProjectDesc: `Follow our documentation to help get you set up as an Node Operator then head over to the Explorer to find the first project you would like to index.`,
    learnMore: 'Learn how to index a project <1>here</1>',
    description:
      'All SubQuery projects you are currently indexing, you can also update staking amounts and allocate your stake to different projects here',
  },
  indexerPlans: {
    title: 'You haven’t created any plans yet',
    description: 'Create your first plan to advertise your indexing service to Consumers for purchase.',
    learnMore: 'Learn how to create a plan <1>here</>',
  },
  indexerOfferMarket: {
    noOffersTitle: 'There are no current offers for you to accept',
    noOffers:
      'As an Node Operator, you can explore and accept offers here once they have been created by Consumers. Once accepted, the offer will appear under Service Agreements. ',
    learnMore: 'Learn Marketplace <1>here<1>',
    listDescription:
      'As an Node Operator, you can explore and accept offers being advertised by Consumers which will generate service agreements',
  },
  consumerOfferMarket: {
    listDescription: 'A list of all offers published by Consumers that are available to be accepted by Node Operators',
    noOffersTitle: 'There are no offers here yet',
    noOffers:
      'As a Consumer, you can go to My Offers to create your own offer which will be published on the Offer Marketplace. Node Operators will accept your offer to create a service agreement and begin indexing the data for you.',
  },
  myDelegators: {
    noDelegatorsTitle: 'You don’t have any Delegators yet',
    noDelegatorsDescription:
      'Once Delegators have delegated their SQT to you, they will appear here. First you need to register as an Node Operator and begin indexing SubQuery projects, Delegators can then delegate their SQT to you to earn rewards. Delegators are more likely to delegate their SQT to high performing Node Operators and Consumers will be attracted to Node Operators with more SQT delegated as it indicates they are reliable.',
    noDelegatorsInfoLink: 'Learn more about Delegators ',
  },
  tokenApproval: {
    approve: 'Allow the SubQuery Network to use your {{token}}',
    approveToProceed: 'You must give the SubQuery Network smart contracts permission to use your {{token}}.',
    confirm: 'Approve on MetaMask',
  },

  claimIndexerRewards: {
    title: 'Collect early era’s rewards from this Node Operator',
    confirmToProceed: `Sign the transaction to collect all the early era’s rewards from this Node Operator, this transaction includes claiming the Node Operator’s early era’s rewards and executing the Node Operator’s staking changes which are blocked due to the unclaimed era rewards.

    You can undelegate your funds after the transaction is complete.`,
    confirm: 'Confirm collect',
    failureCollect: 'Sorry, collect rewards transaction has failed.',
  },
  topIndexers: {
    desc: 'View the top 100 ranked Node Operators and all other Node Operators in the SubQuery Network and delegate your SQT tokens to earn rewards.',
    nonData: 'There is no data to display',
    rank: 'indexer rank',
    uptime: 'uptime',
    ownStake: 'own stake',
    delegated: 'delegated',
    eraRewardsCollection: 'era reward collection',
    timeToUpgrade: 'time to upgrade',
    ssl: 'ssl',
    socialCredibility: 'social credibility',
    tooltip: {
      rank: 'The ranking of the Node Operator compared to all other Node Operators based of a variety of factors. A ranking of 1 means that they have historically operated as the best Node Operator, however this does not indicate future performance.',
      uptime: 'Based on the avaliability of an Node Operator’s proxy service endpoint overtime',
      ownStake: `The percentage of all staked ${TOKEN} that is the Node Operator’s own SQT. Higher score is better.`,
      delegated:
        'The percentage of the Node Operator’s total delegation that is the Node Operator’s own SQT. Higher score is better.',
      eraRewardsCollection:
        'How fast and frequently does the Node Operator collect rewards on behalf of their delegators. Frequent is better.',
      timeToUpgrade:
        'How fast Node Operators upgrade their Node Operator Services once a new version is released. Higher is better.',
      ssl: 'If Node Operators have enabled SSL on their endpoints. Enabled is better',
      socialCredibility:
        'If Node Operators have provided a ENS name pointing towards their account address. Enabled is better.',
    },
    commission: 'Commission',
    commissionTooltip:
      "Node Operators set an Node Operator's Commission Rate (ICR) which is the percentage Node Operators earn. The remaining is then shared amongst the Node Operator and all Delegators propotionally by staked/delegated amount. \n A lower ICR will be more attractive for Delegators as a larger percentage of rewards is shared between Delegators.",
  },
  allIndexers: {
    nonData: 'There is no Node Operator available.',
    desc: 'View all Node Operators in the SubQuery Network and delegate your SQT tokens to earn rewards.',
  },
} as const;

export default translation;
