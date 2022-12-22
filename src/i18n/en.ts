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
      governance: 'Governance',
      documentation: 'Documentation',
      forum: 'Forum',
      github: 'Github',
      connectWallet: 'Connect',
      hosted: 'Frontier (Testnet)',
      swap: 'Swap',
      importToken: `Import ${process.env.REACT_APP_TOKEN} to wallet`,
      importStableToken: `Import ${process.env.REACT_APP_STABLE_TOKEN} to wallet`,
      disconnect: 'Disconnect',
    },
    globalBanner: {
      title: 'Season 3 Frontier Testnet has started 🔥',
      description: 'Duration: {{startDate}} - {{endDate}} Local Time',
      duration: 'Duration',
      seasonEndTitle: 'Season 3 has finished, SubQuery Frontier was a huge success! 🔥',
      seasonEndDescription:
        'The incentivised phase of the SubQuery Frontier Network has finished, get ready for the Kepler Network',
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
        tab3: 'Service Agreement',
        tab4: 'Flex Plan',
        // tab3: 'Playground',
      },
      home: {
        header: 'SubQuery projects',
      },
      flexPlans: {
        indexer: 'indexer',
        validityPeriod: 'Validity Period',
        non: 'There are no flex plans for this project yet.',
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
      subtitle: 'To participate in our test network, please start by connecting your wallet first.',
      connectWith: 'Connect With:',
      metamaskDesc: 'Connect with Metamask browser extension',
      talismanDesc: 'Connect with Talisman browser extension',
      withMetamask: 'Connect with Metamask',
      withTalisman: 'Connect with Talisman',
    },
    unsupportedNetwork: {
      title: 'Unsupported network',
      subtitle: 'Please switch networks to use the Studio',
      button: 'Switch Network',
    },
    indexerProgress: {
      projectSynced: 'Up to date',
      blocks: '{{count}} block behind',
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
      profile: 'My profile',
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
      secondRowData:
        'Data displayed after <returnRightIcon /> means the data that will take into effect from next era.',
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
      nonData: 'There is no data to display',
      rank: 'indexer ranking',
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
      undelegateAmount: `Enter the amount of ${process.env.REACT_APP_TOKEN} you want to undelegate`,
      confirmUndelegate: 'Confirm Undelegation',
      delegateFailure: 'Sorry, the delegation has been failed.',
      delegateSuccess: 'Success! Your delegation has been done.',
      approveTokenToDelegate: 'Approve your token for staking',
      noDelegating: 'No delegation available',
      yourDelegateAmount: 'Your Delegation Amount',
      none: 'No delegator available',
      viewProfile: 'View indexer profile',
      totalAmount: 'You have {{count}} current delegation',
      totalAmount_other: 'You have {{count}} current delegations',
      invalidDelegateBeforeRewardCollect: `This indexer cannot be delegated to until they collect all the early era's rewards. Please contact the indexer to resolve the issue.`,
      invalidUndelegateBeforeRewardCollect: `This indexer cannot be undelegated from until they collect all the early era's rewards. Please contact the indexer to resolve the issue.`,
      nonToUndelegate: `There is 0 ${process.env.REACT_APP_TOKEN} delegating for next era.`,
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
      enterWithdrawAmount: `Enter the amount of ${process.env.REACT_APP_TOKEN} you want to withdraw`,
      confirmWithdraw: 'Confirm Withdrawal',
      aboutToWithdraw: `You are about to withdraw {{amount}} ${process.env.REACT_APP_TOKEN}.`,
    },

    projects: {
      deploymentId: 'Deployment ID',
      nonDeployments: 'No deployed projects available.',
    },
    rewards: {
      none: 'No rewards available.',
      indexer: 'Indexer',
      amount: 'Amount',
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

    plans: {
      category: {
        myServiceAgreement: 'My Service Agreements',
        myPlan: 'My Plans',
        manageMyPlans: 'Manage My Plans',
        myOffers: 'Manage My Offers',
        offerMarketplace: 'Offer Marketplace',
        myFlexPlans: 'My Flex Plans',
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
        notReadyToBePurchased: `This plan cannot be purchased until the indexer status is 'Ready'`,
      },
    },
    flexPlans: {
      project: 'project',
      indexer: 'indexer',
      validityPeriod: 'Validity Period',
      spent: 'spent',
      channelStatus: 'Channel Status',
      duration: 'duration',
      remainDeposit: 'remaining deposit',
      request: '{{count}} request',
      request_other: '{{count}} requests',
      billBalance: 'Billing Balance',
      billingAccount: 'The balance of your billing account {{amount}}',
      billingAccountTooltip:
        'When you purchase a flex plan, you need to transfer SQT to your billing account from your wallet. The funds are kept in your billing account to allow you to purchase multiple flex plans using the same funds. To view, transfer, or withdraw from your billing account, please visit the My Flex Plan page under Plan & Offer',
      walletBalance: 'WALLET BALANCE',
      non: 'There are no flex plan list. ',
      purchaseModal: 'Purchase Flex Plan',
      expectQueryPeriod: 'Expected query period',
      expectQueryPeriodTooltip:
        'The number of days that you expect to query, the value needs to be less than the Validity Period.',
      invalidQueryPeriod: 'Please input a valid query period.',
      depositAmount: 'Amount to deposit',
      depositAmountTooltip:
        'This amount will go towards your flex plan, to avoid affecting query performance, please ensure you have sufficient funds.',
      invalidDepositAmount: 'Please input a valid deposit.',
      purchase: 'Purchase',
      purchased: 'Purchased',
      confirmPurchase: 'Confirm Purchase',
      disabledPurchase: 'Indexer might be offline.',
      successPurchaseTitle: 'Success',
      successPurchaseDesc: 'You have successfully purchased the plan!',
      own: 'Created by you',
    },
    myFlexPlans: {
      billing: {
        transfer: `Transfer ${process.env.REACT_APP_TOKEN ?? 'SQT'} to billing account`,
        addToken: `Add ${process.env.REACT_APP_TOKEN ?? 'SQT'}`,
        confirmTransfer: 'Confirm Transfer',
        transferDescription:
          'When transferring SQT you are also authorising SubQuery to perform some automated tasks on your behalf. For example:  topping up your Flex Plans that are running low on funds or terminating a channel if the indexer requests it to be closed. This automation will prevent delays and give you the best user experience.',
        transferToken: `Transfer ${process.env.REACT_APP_TOKEN ?? 'SQT'}`,
        failureTransfer: `Sorry, failed to transfer ${process.env.REACT_APP_TOKEN ?? 'SQT'}`,
        successTransfer: `You have successfully transferred ${process.env.REACT_APP_TOKEN ?? 'SQT'}`,
        notEnoughToken: `You don't have enough SQT in your wallet.`,
        withdrawTitle: `Withdraw ${process.env.REACT_APP_TOKEN ?? 'SQT'} to wallet`,
        withdraw: `Withdraw ${process.env.REACT_APP_TOKEN ?? 'SQT'} to wallet`,
        withdrawToken: `Withdraw ${process.env.REACT_APP_TOKEN ?? 'SQT'}`,
        confirmWithdraw: 'Confirm withdraw',
        failureWithdraw: `Sorry, failed to withdraw ${process.env.REACT_APP_TOKEN ?? 'SQT'}`,
        successWithdraw: `You have successfully withdrawn ${process.env.REACT_APP_TOKEN ?? 'SQT'}`,
      },
      claim: {
        title: 'Claim remainding desposit',
        description: 'You are about to claim {{remaindingDeposit}} {{token}} from the flex plan',
        button: 'Claim',
        submit: 'Confirm claim',
        failureText: 'Sorry, failed to claim flex plan',
      },
      playground: {
        title: 'Playground',
      },
      terminate: {
        title: 'Terminate',
        terminatePlan: 'Terminate this plan',
        terminateDesc: `Are you sure you want to terminate this plan? Once you confirm, the query endpoint will be deactivated and you will be able to claim back the remaining deposit to your billing account. `,
        remainDeposit: 'Remaining deposit',
        failure: 'Failed to terminate this plan.',
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
        sessionToken: 'Session Token',
        tokenExpireIn: 'Token expires in',
        comingSoon: 'Playground coming soon.',
        error: 'There is an issue with playground, please check with indexer.',
        queryTitle: 'Playground Query',
        expiredToken: 'The auth token for playground query has expired.',
      },
      non: 'There are no service agreements for this project yet. <br> Learn more from <1>here</1>',
      nonOngoing: 'You don’t have any ongoing service agreement yet. <br> Learn more from <1>here</1>.',
      nonExpired: 'You don’t have any expired service agreement yet. <br> Learn more from <1>here</1>.',
    },
    myOffers: {
      title: 'My offers',
      open: 'Open',
      openTooltip: 'Offers that are still open to indexers to accept',
      closed: 'Closed',
      closedTooltip: 'Offers that have reached the indexer cap and can no longer be accepted',
      closedDescription: 'Here you can find the offers that have reached indexer cap',
      expired: 'Expired',
      expiredDescription:
        'Here you can find the expired offers which did not reach the required number of indexers. \n  You can withdraw your unspent balance from these offers.',
      expiredUnspent: 'You can withdraw your unspent balance from these offers.',
      expiredTooltip:
        'You can find offers that have expired or cancelled without reaching the indexer cap. You can withdraw any unspent balance here',
      createOffer: 'Create an Offer',
      non: 'There is no offers available.',
      table: {
        versionDeployment: 'Version - Deployment ID',
        indexerAmount: 'No. of indexers',
        accepted: 'Accepted',
        acceptedTooltip: 'This is the number of indexers that have already accepted this offer',
        cap: 'Cap',
        capTooltip: 'This is the maximum number of indexers that can accept this offers',
        dailyRewardsPerIndexer: 'Daily Rewards Per indexer',
        dailyRewardsPerIndexerTooltip: 'This is the daily amount a indexer will receive from accepting the offer',
        totalRewardsPerIndexer: 'Total Rewards per indexer',
        totalRewardsPerIndexerTooltip:
          'This is the total amount a indexer will receive from accepting the offer. This amount is calculated as the daily rewards per indexer multiplied by the period.',
        depositAmount: 'Total deposit',
        period: 'Period',
        periodTooltip:
          'This is the duration the indexer who has accepted this offer will be receiving their rewards for',
        minIndexedHeight: 'min indexed height',
        minIndexedHeightTooltip:
          'Only the indexer that has indexed to this block height or above can accept this offer',
        expired: 'Expire',
        unspendBalance: 'Unspent balance',
        amount: 'Amount',
        totalOpenOffer: 'You have {{count}} open offer',
        totalOpenOffer_other: 'You have {{count}} open offers',
      },
      steps: {
        step_0: 'Choose Deployment ID',
        step_1: 'Choose Template',
        step_2: 'Set Details',
        step_3: 'Confirm',
      },
      step_0: {
        title: 'Step 1: Find the SubQuery Project Deployment ID for this offer',
        description:
          'You can copy & paste the deployment ID of your desired project by entering their project detail page from  <1>explorer<1>.',
        search: 'Search deployment ID',
        selectedId: 'Selected ID',
      },
      step_1: {
        title: 'Step 2: Choose an offer template from below',
      },
      step_2: {
        title: 'Step 3: Set the details for your offer',
        rewardPerIndexer: 'Total rewards per indexer',
        rewardPerIndexerTooltip: 'This is the total amount a indexer will receive from accepting the offer.',
        rewardPerIndexerErrorMsg: 'Please put a valid reward for an indexer.',
        indexerCap: 'Indexer cap',
        indexerCapWithCount_one: '{{count}} Indexer',
        indexerCapWithCount_other: '{{count}} Indexers',
        indexerCapTooltip: 'This is the maximum number of indexers that can accept this offers',
        indexerCapErrorMsg: 'Please put a valid indexer cap.',
        totalDeposit: 'Required deposit',
        totalDepositTooltip: `This amount is calculated as the rewards per indexer multiplied by the indexer cap that you have stated above. \n
        You will need to deposit this amount when you confirm the creation of this offer on MetaMask. Any unspent balance can be withdrawn when the offer expires or if you cancel the offer prior to expiration`,
        totalDepositErrorMsg: 'Not enough balance. Lower the numbers set up above or deposit more to the wallet.',
        minimumIndexedHeight: 'Minimum indexed height',
        minimumIndexedHeightTooltip:
          'Only the indexer that has indexed to this block height or above can accept this offer.',
        minimumIndexedHeightErrorMsg: 'Please put a valid block height.',
        expireDate: 'Expiration time',
        expireDateTooltip:
          'Indexer cannot accept this offer after the expiration time. However, the indexer that have already accepted the offer will not be affected.',
        cancelWarning:
          'Cancelling an offer before it expires will result in 10% of the unspent balance being charged as a cancellation fee.',
      },
      step_3: {
        title: 'Step 4: Confirm offer summary',
        consumer: 'Consumer',
        deploymentId: 'Deployment ID',
        offerTemplate: 'Offer Template',
        detailSettings: 'Detail settings',
      },
      cancel: {
        title: 'Cancel this offer',
        description:
          'By cancelling this open offer, you will be able to withdraw the unspent balance. Cancellation fee will be applied and be deducted from the unspent balance.',
        failureText: 'Sorry, failed to cancel offer',
        cancelFee: 'Cancellation fee',
        unSpent: 'Unspent balance',
        youWillReceive: 'You will receive',
      },
      withdraw: {
        title: 'withdraw',
        modalTitle: 'Withdraw from the offer',
        description: `You are about to withdraw {{bigNumAmount}} ${process.env.REACT_APP_TOKEN} from this offer to your wallet`,
        failureText: 'Sorry, failed to withdraw offer',
      },
    },
    offerMarket: {
      header: 'Offer Marketplace',
      viewAsIndexer: 'If you are an indexer, here is where you can explore and accept offers. ',
      totalOffer: 'Total {{count}} offer',
      totalOffer_other: 'Total {{count}} offers',
      accept: 'Accept',
      searchByDeploymentId: 'Search by deployment Id',
      alreadyAcceptedOffer: 'You have already accepted this offer',
      acceptModal: {
        nonCriteriaData: 'There is no criteria data available',
        moveFromSummary: 'Move to the next step to check you meet the criteria for this offer.',
        title: 'Accept the offer',
        check: 'Check criteria',
        offerSummary: 'Offer summary',
        consumer: 'Consumer',
        passCriteria: 'You have passed {{count}} criteria',
        criteria: 'Criteria',
        yourProject: 'Your Project',
        indexingStatus: 'Indexing progress',
        indexingStatusError: 'Your project needs to be 100% indexed.',
        projectStatus: 'Project status',
        projectStatusError: 'You can announce ‘Ready’ for the project from the indexer admin app.',
        blockHeight: 'Block height',
        blockHeightError: 'Your project is currently behind the minimum blockheight.',
        dailyRewards: 'Daily Rewards',
        dailyRewardsError: `Please stake more ${process.env.REACT_APP_TOKEN} or get more delegation to increase daily reward capacity.`,
        failureText: 'Failed to accept offer',
        afterAcceptOffer:
          'By accepting the offer, a service agreement will be created between you and the consumer after you confirm on MetaMask.',
      },
    },
    swap: {
      buyKSQT: `${process.env.REACT_APP_STABLE_TOKEN} → ${process.env.REACT_APP_TOKEN}`,
      sellKSQT: `${process.env.REACT_APP_TOKEN} → ${process.env.REACT_APP_STABLE_TOKEN}`,
      poolSize: `${process.env.REACT_APP_TOKEN} pool size`,
      poolSizeTooltip: `This is the amount of ${process.env.REACT_APP_TOKEN} currently available to be purchased in the liquidity pool`,
      curRate: 'current rate',
      curRateTooltip: 'The token rate will remain fixed in Kepler network before mainnet is launched',
      dataUpdateEvery5Min: 'Data is updated every 5 minutes',
      from: 'From',
      to: 'To',
      swappableBalance: 'Your Swappable BALANCE',
      swappableBalanceTooltip: `This is calculated by the total rewards you’ve claimed minus the amount you’ve swapped for ${process.env.REACT_APP_STABLE_TOKEN}.`,
      approveUSD: `Approve ${process.env.REACT_APP_STABLE_TOKEN}`,
      swapButton: 'Swap',
      walletBalance: 'Wallet Balance',
      noOrderInPool: 'There is no available order in pool currently.',
      confirmSwap: 'Confirm Swap',
      reviewSwap: 'Review Swap',
      swapReviewTitle: 'You are going to swap:',
      swapSuccess: 'The swap transaction has succeeded.',
      swapFailure: 'The transaction has failed.',
    },

    general: {
      action: 'action',
      current: 'current',
      next: 'next',
      cancel: 'cancel',
      status: 'Status',
      back: 'Back',
      active: 'Active',
      inactive: 'Inactive',
      terminated: 'Terminated',
      terminating: 'Terminating',
      completed: 'Completed',
      comingSoon: 'Coming soon.',
      choose: 'choose',
      confirm: 'Confirm',
      confirmOnMetamask: 'Confirm On MetaMask',
      confirmCancellation: 'Confirm Cancellation',
      day: 'day',
      days: 'days',
      day_other: '{{count}} days',
      block: 'Block',
      blocks: 'Blocks',
      blockWithCount: '{{count}} Block',
      blockWithCount_other: '{{count}} Blocks',
      balance: 'Balance',
      frequent: 'Frequent',
      infrequent: 'Infrequent',
      enabled: 'Enabled',
      disabled: 'Disabled',
      price: 'price',
      connectAccount: 'Please connect account.',
    },
    status: {
      success: 'Success!',
      error: 'Sorry, there is something wrong',
      txSubmitted: 'Transaction has been submitted. Please wait for the transaction confirmed.',
      changeValidIn15s: 'Change will be reflected on dashboard in 15s.',
    },
  },
};

export type Translations = typeof en;

export default en;
