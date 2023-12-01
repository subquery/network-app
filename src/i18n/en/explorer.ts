// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { STABLE_TOKEN, TOKEN } from '@utils/constants';

const translation = {
  header: {
    self: {
      title: 'SubQuery Kepler',
      description:
        "Decentralise your project with SubQuery's Kepler Network, which provides indexed data to the global community in an incentivised and verifiable way. You can join and participate as a Consumer, Delegator, or even as an Indexer.",
    },
    externalExplorer: {
      title: 'SubQuery Explorer',
      description:
        "Explore SubQuery projects built by other teams in the community and hosted on SubQuery's Managed Service. Get inspired and see what others are building!",
    },
    managedService: {
      title: 'SubQuery Managed Service',
      description:
        "Use SubQuery's Managed Service to host your SubQuery project, upgrade existing projects, and view detailed analytics on how your SubQuery Project is operating.",
    },
    explorer: 'Explorer',
    studio: 'Studio',
    staking: 'Stake & Delegate',
    plans: 'Plan & Offer',
    missions: 'Missions',
    governance: 'Governance',
    documentation: 'Documentation',
    ecosystem: 'Ecosystem',
    forum: 'Forum',
    github: 'Github',
    connectWallet: 'Connect',
    hosted: 'Frontier (Testnet)',
    swap: 'Swap',
    importToken: `Import ${TOKEN} to wallet`,
    importStableToken: `Import ${STABLE_TOKEN} to wallet`,
    disconnect: 'Disconnect',
    walletBalance: `Wallet Balance: {{balance}} ${TOKEN}`,
  },
  globalBanner: {
    title: 'Season 3 Frontier Testnet has started 🔥',
    description: 'Duration: {{startDate}} - {{endDate}} Local Time',
    duration: 'Duration',
    seasonEndTitle: 'Season 3 has finished, SubQuery Frontier was a huge success! 🔥',
    seasonEndDescription:
      'The incentivised phase of the SubQuery Frontier Network has finished, get ready for the Kepler Network',
  },
  account: {
    title: {
      delegating: 'You are Delegating',
      staking: 'You are Staking',
      rewards: 'Your Rewards',
      withdrawn: 'Withdrawn',
    },
    tooltip: {
      delegating: 'The amount of kSQT that you are delegating to Indexers in the SubQuery Network to earn rewards',
      staking: 'The amount of kSQT that you have staked against projects you are indexing in the SubQuery Network',
      rewards: 'The amount of rewards earned by participating in the SubQuery Network through delegating or staking',
      withdrawn: 'The amount of kSQT that you have undelegated or unstaked',
    },
    linkText: {
      delegating: 'Delegate to an Indexer',
      staking: 'Start Staking',
      rewards: 'View Rewards',
      withdrawn: 'View Withdrawn',
    },
    viewDetails: 'View Details',
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
      header: 'SubQuery Explorer',
      headerDesc:
        'Explore some of the SubQuery Projects hosted and run in a decentralised, trustless, and verifiable way by indexers around the world',
    },
    flexPlans: {
      indexer: 'indexer',
      validityPeriod: 'Validity Period',
      non: 'There are no flex plans for this project yet.',
      requestToken: 'To start testing your queries in the GraphQL playground, simply request a trial token.',
      remainLimit: 'Remain requests limit: {{limit}}',
      expireTime: 'Token expires in {{time}}',
    },
  },
  deployment: {
    create: {
      title: 'Create New Deployment',
      version: 'Version',
      description: 'Description',
      deploymentId: 'Deployment ID',
      explainer: 'You can get a deployment id by running `subql publish` from the command line',
      submit: 'Deploy New Version',
    },
  },
  noIndexers: {
    description: 'no indexers available',
    title: 'Start indexing this project',
    subtitle: 'Learn how to index a SubQuery project ',
  },
  indexers: {
    head: {
      indexers: 'Indexers',
      progress: 'Progress',
      status: 'Status',
      url: 'Query URL',
      plans: 'Plans',
      playground: 'Playground',
    },
    tooltip: {
      status: 'The offline status means that the node service or query service of the indexer is in an unhealthy state',
      connection:
        "We can't connect to this Indexer's metadata endpoint, it appears that they are offline. You can verify this by making a HTTP GET request to",
      error: 'Indexer Connection Error',
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
    deploymentDescription: 'Deployment Details',
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
    title: 'Connect your wallet',
    subtitle:
      "To continue, please connect your wallet to the SubQuery Network. If you don't have a wallet, you can select a provider and create one now.",
    connectWith: 'Connect With:',
    metamaskDesc: 'Connect with Metamask browser extension',
    talismanDesc: 'Connect with Talisman browser extension',
    withMetamask: 'Connect with Metamask',
    withTalisman: 'Connect with Talisman',
  },
  unsupportedNetwork: {
    title: 'Unsupported network',
    subtitle: 'Please switch to {{supportNetwork}} to use SubQuery Explorer.',
    button: 'Switch Network',
  },
  indexerProgress: {
    blocks: 'Indexing blocks',
  },
  deployments: {
    header1: 'Version',
    header2: 'Deployment ID',
    header3: 'Description',
    header4: 'Created',
  },
} as const;

export default translation;
