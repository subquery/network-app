// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

const translation = {
  consumer: 'Consumer',
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
    disabledPurchaseAsOffline: 'Indexer is offline.',
    successPurchaseTitle: 'Success',
    successPurchaseDesc: 'You have successfully purchased the plan!',
    own: 'Created by you',
  },
  myFlexPlans: {
    description:
      'Flex Plans are advertised by Indexers on each SubQuery Project in the Explorer. View and terminate your purchased Flex Plans here.',
    ongoing: 'Ongoing',
    closed: 'Closed',
    playground: 'Playground',
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
      title: 'Claim remaining deposit',
      description: 'You are about to claim {{remainDeposit}} {{token}} from the flex plan',
      button: 'Claim',
      submit: 'Confirm claim',
      failureText: 'Sorry, failed to claim flex plan',
      claimed: 'Claimed',
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
    title: 'My Offers',
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
      periodTooltip: 'This is the duration the indexer who has accepted this offer will be receiving their rewards for',
      minIndexedHeight: 'min indexed height',
      minIndexedHeightTooltip: 'Only the indexer that has indexed to this block height or above can accept this offer',
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
};

export default translation;
