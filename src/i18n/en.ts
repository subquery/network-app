// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

const en = {
  translation: {
    header: {
      explorer: 'Explorer',
      studio: 'Studio',
      staking: 'Stake & Delegate',
      plans: 'Plan & Offer',
      missions: 'Missions',
      documentation: 'Documentation',
      github: 'Github',
      connectWallet: 'Connect',
      hosted: 'Frontier (Testnet)',
    },
    footer: {
      title: 'Join The Future',
      copyright: 'SubQuery © ',
    },
    projectCard: {
      noDescription: 'No description',
    },
    studio: {
      create: {
        name: 'Name',
        image: 'Upload Logo',
        subtitle: 'Subtitle',
        description: 'Description',
        websiteUrl: 'Website URL',
        codeUrl: 'Code URL',
      },
      project: {
        tab1: 'Details',
        tab2: 'Deployments',
      },
      wallet: {
        connect: 'Connect wallet to use the studio',
        subTitle:
          'Use the studio to create and manage your SubQuery projects. <br> Learn how to create a SubQuery project <1>here</1>.',
      },
    },
    explorer: {
      project: {
        tab1: 'Overview',
        tab2: 'Indexers',
        tab3: 'Playground',
      },
      home: {
        header: 'SubQuery projects',
      },
    },
    deployment: {
      create: {
        title: 'Create New Deployment',
        version: 'Version',
        description: 'Description',
        deploymentId: 'Deployment ID',
        explainer: 'You can get a deployment id by running `subqul publish` from the command line',
        submit: 'Deploy New Version',
      },
    },
    noIndexers: {
      preTitle: 'no indexers available',
      title: 'Start indexing this project',
      subtitle: 'Learn how to index a SubQuery <1>here</1>',
    },
    indexers: {
      head: {
        indexers: 'Indexers',
        progress: 'Progress',
        status: 'Status',
        url: 'Query URL',
        plans: 'Plans',
      },
    },
    create: {
      title: 'Create your first SubQuery project',
      subtitle: 'Learn how to create a SubQuery project <1>here</1>.',
      button: 'Create a project',
      step1: {
        name: 'Step 1',
        title: 'Create',
        subtitle: 'Give your SubQuery project a name.',
      },
      step2: {
        name: 'Step 2',
        title: 'Install',
        subtitle: 'Install the SubQuery CLI.',
      },
      step3: {
        name: 'Step 3',
        title: 'Define & Deploy',
        subtitle: 'Define and deploy your SubQuery project in the CLI.',
      },
      step4: {
        name: 'Step 4',
        title: 'Publish',
        subtitle:
          'Fill out metadata and deployment details, then when you are ready, publish your SubQuery project to the Explorer.',
      },
    },
    edit: {
      submitButton: 'Save',
      cancelButton: 'Cancel',
    },
    createInsturctions: {
      button: 'View Documentation',
      title1: 'Install Subql CLI',
      content1_1: 'The @subql/cli (opens new window)tool helps to create define and deploy a subquery project.',
      content1_2: 'Install SubQuery CLI globally on your terminal by using NPM:',
      title2: 'Deployment Version',
      content2: 'A semver for the deployment. e.g. 1.0.0',
      title3: 'Deployment ID',
      content3: 'The deployment id, this can be acquired by running <1>subql publish</1> with the CLI',
      installCommand: 'npm i -g @subql/cli',
    },
    newProjectModal: {
      title: 'Create a SubQuery project',
      subtitle: `Project name doesn't need to be unique and you can change the project name later.`,
      button: 'Continue',
      placeholder: 'Project Name',
    },
    projectOverview: {
      createdAt: 'Created',
      updatedAt: 'Last Updated',
      deploymentDescription: 'Deployment Description',
    },
    projectDetail: {
      description: 'Description',
      websiteUrl: 'Website URL',
      sourceUrl: 'Source Code URL',
      button: 'Edit',
    },
    projectHeader: {
      id: 'Project ID',
      deploymentId: 'Deployment ID',
    },
    connectWallet: {
      title: 'Connect wallet',
      subtitle: 'Create and manage your SubQuery projects. <br> Learn how to create a SubQuery project <1>here</1>.',
      connectWith: 'Connect With:',
      metamaskDesc: 'Connect with Metamask browser extension',
    },
    unsupportedNetwork: {
      title: 'Unsupported network',
      subtitle: 'Please switch networks to use the Studio',
      button: 'Switch Network',
    },
    indexerProgress: {
      blocks_one: '1 block behind',
      blocks_other: '{{count}} blocks behind',
    },
    deployments: {
      header1: 'Version',
      header2: 'Deployment ID',
      header3: 'Description',
      header4: 'Created',
    },
    errors: {
      transactionRejected: 'User rejected the request',
    },
    indexer: {
      title: 'Indexer',
      indexers: 'Indexers',
      profile: 'My profile',
      currentEra: 'Current Era',
      indexing: 'Indexing',
      totalStakeAmount: 'Total Stake amount',
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
      stakeInputTitle: 'Enter the amount of SQT you want to stake',
      confirmStake: 'Confirm Stake',
      enterUnstakeAmount: 'Enter Unstake Amount',
      unstakeValidNextEra:
        'Tokens will be unstaked from next era. They will then be locked for {{duration}} before you can withdraw. During this period, tokens do not earn any rewards.',
      unstakeInputTitle: 'Enter the amount of SQT you want to unstake',
      confirmUnstake: 'Confirm Unstake',
      updateCommissionRate: 'Change commission rate',
      setNewCommissionRate: 'Set new commission rate',
      disabledSetCommissionBeforeRewardClaim: `You can't change commission rate until you collect all early era's rewards. Please check the indexer admin app to ensure the lastClaimedEra = ‘currentEra - 1’.`,
      newRateValidNext2Era: 'Once confirm, the new rate will take 2 full eras to be effective.',
      enterCommissionRate: 'Enter the commission rate',
      currentRate: 'Current rate',
      confirmRate: 'Confirm Rate',
      action: 'action',
      approveToken: 'Allow the SubQuery Network to use your SQT',
      approveTokenToProceed: 'You must give the SubQuery Network smart contracts permission to use your SQT.',
      confirmApproval: 'Approve on MetaMask',
      notRegister: 'You haven’t registered as an indexer yet.',
      doStake: 'You haven’t staked yet. Stake to become an indexer.',
      learnMore: 'Learn how to become an indexer',
      topRowData: 'Top row of the data represents the data in current era.',
      secondRowData:
        'Data displayed after <returnRightIcon /> means the data that will take into effect from next era.',
      here: 'here',
      amount: ' There are {{count}} indexer.',
      amount_other: ' There are {{count}} indexers.',
    },

    delegate: {
      title: 'Delegate',
      delegating: 'Delegating',
      to: 'To',
      from: 'From',
      redelegate: 'You can delegate from wallet or choose an indexer to redelegate from',
      totalDelegation: 'Total Delegation to indexer(s)',
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
        'Tokens will be undelegated from next era. They will then be locked for 28 days before you can withdraw. During this period, tokens do not earn any rewards. ',
      undelegateAmount: 'Enter the amount of SQT you want to undelegate',
      confirmUndelegate: 'Confirm Undelegation',
      delegateFailure: 'Sorry, the delegation has been failed.',
      delegateSuccess: 'Success! Your delegation has been done.',
      approveTokenToDelegate: 'Approve your token for staking',
      noDelegating: 'No delegation available',
      yourDelegateAmount: 'Your Delegation Amount',
      none: 'No delegator available',
      viewProfile: 'View indexer profile',
      totalAmount: 'You have total {{count}} delegation',
      totalAmount_other: 'You have total {{count}} delegations',
      invalidDelegateBeforeRewardCollect: `This indexer cannot be delegated to until they collect all the early era's rewards. Please contact the indexer to resolve the issue.`,
      invalidUndelegateBeforeRewardCollect: `This indexer cannot be undelegated from until they collect all the early era's rewards. Please contact the indexer to resolve the issue.`,
    },

    withdrawals: {
      unlockedAsset: 'You can withdraw total of {{count}} unlocked asset.',
      unlockedAsset_other: 'You can withdraw total of {{count}} unlocked assets.',
      amount: 'amount',
      startAt: 'start at',
      endAt: 'end at',
      status: 'status',
      lock: 'lock',
      unlock: 'unlock',
      noWithdrawals: 'No withdrawals available.',
      withdrawToken: 'Withdraw all unlocked assets',
      withdraw: 'Withdraw',
      confirm: 'Confirm withdrawal amount',
      enterWithdrawAmount: 'Enter the amount of SQT you want to withdraw',
      confirmWithdraw: 'Confirm Withdrawal',
      aboutToWithdraw: 'You are about to withdraw {{amount}} SQT.',
    },

    projects: {
      deploymentId: 'Deployment ID',
      nonDeployments: 'No deployed projects available.',
    },
    rewards: {
      none: 'No rewards available.',
      header1: 'Indexer',
      header2: 'Amount',
      header3: 'Action',
      claim: {
        title: 'Claim Rewards',
        step1: 'Confirm claim',
        desription: 'You are about to claim {{amount}} SQT',
        button: 'Claim',
        submit: 'Confirm Claim',
      },
      totalUnclaimReward: 'You have an unclaimed reward.',
    },

    missions: {
      missions: 'Missions',
      leaderboard: 'Leaderboard',
      indexing: {},
      delegating: {},
    },

    plans: {
      category: {
        myServiceAgreement: 'My Service Agreements',
        myPlan: 'My Plans',
        manageMyPlans: 'Manage My Plans',
        myOffers: 'Manage My Offers',
        offerMarketplace: 'Offer Marketplace',
      },
      default: {
        title: 'You can create maximum 5 default plans',
        createPlans: `Create plans for projects you're indexing. <br> Learn how to create a plan <1>here</1>.`,
        query: '{{count}} query',
        query_other: '{{count}} queries',
        requestPerMin: 'requests/min',
      },
      specific: {
        title: 'You can create maximum 5 specific plans',
        nonPlans:
          'You are not indexing any deployments to have specific plan.<br> Learn how to create a specific plan <1>here</1>.',
        nonDeployment: 'You have no plans specific to this deployment',
      },
      headers: {
        id: 'Id',
        price: 'Price',
        period: 'Period',
        dailyReqCap: 'Daily Request Cap',
        rateLimit: 'Rate Limit',
        action: 'Action',
        deploymentId: 'Deployment Id',
      },
      create: {
        action: 'Create',
        title: 'Create a Plan',
        step1: 'Set parameters',
        description: 'Template',
        failureText: 'Failed to create plan',
        priceTitle: 'Set a price for this plan',
        cancel: 'Cancel',
        submit: 'Create',
      },
      remove: {
        action: 'Remove',
        title: 'Are you sure you want to remove this plan?',
        description: 'Plan Details',
        failureText: 'Failed to remove plan',
        submit: 'Confirm Removal',
        cancel: 'Not now',
      },
      purchase: {
        action: 'purchase',
        title: 'Purchase Plan',
        step1: 'Confirm details',
        description: 'Plan Details',
        failureText: 'Failed to purchase plan',
        submit: 'Purchase',
        cancel: 'Cancel',
        yourBalance: 'Your balance ',
        failToLoadBalance: 'Failed to load balance.',
        noPlansForPurchase: 'There is no plan available to purchase.',
        failureFetchPlans: 'Failed to get plans for indexer',
        notReadyToBePurchased: 'The plan purchase feature is not available until READY status.',
      },
    },
    serviceAgreements: {
      headers: {
        project: 'Project',
        deployment: 'Version - Deployment ID',
        consumer: 'Consumer',
        indexer: 'Indexer',
        expiry: 'Expires In',
        expired: 'Expired',
        price: 'Price',
      },
      playground: {
        title: 'Playground',
        requireSessionToken: 'You need a session token to start querying on playground.',
        requestToken: 'Request token',
        ongoingAgreements: 'My Ongoing Service Agreements',
        auctionAndCrowdloan: 'Polkadot auction & crowdloan',
        sessionToken: 'Session Token',
        tokenExpireIn: 'Token expires in',
        comingSoon: 'Playground coming soon.',
      },
      non: 'You don’t have any ongoing service agreement yet. <br> Learn more from <1>here</1>.',
    },
    myOffers: {
      open: 'Open',
      close: 'Close',
      expired: 'Expired',
    },
    general: {
      current: 'current',
      next: 'next',
      status: 'Status',
      back: 'Back',
      active: 'Active',
      inactive: 'Inactive',
      comingSoon: 'Coming soon.',
      choose: 'choose',
    },
    status: {
      success: 'Success!',
      error: 'Sorry, there is something wrong',
      changeValidIn15s: 'Change will be reflected on dashboard in 15s.',
    },
  },
};

export type Translations = typeof en;

export default en;
