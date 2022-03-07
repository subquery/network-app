// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

const en = {
  translation: {
    header: {
      explorer: 'Explorer',
      studio: 'Studio',
      staking: 'Stake & Delegate',
      documentation: 'Documentation',
      github: 'Github',
      connectWallet: 'Connect',
      hosted: 'Hosted Service',
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
      title: 'Connect wallet to use the studio',
      subtitle:
        'Use the studio to create and manage your SubQuery projects.<br/>Learn how to create a SubQuery project <1>here</1>.',
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
      profile: 'My profile',
      currentEra: 'Current Era',
      indexing: 'Indexing',
      totalStakeAmount: 'Total Stake amount',
      rewards: 'Rewards',
      locked: 'Locked',
      totalStake: 'total stake',
      commission: 'commission',
      delegated: 'delegated',
      capacity: 'capacity',
    },

    delegate: {
      title: 'Delegate',
      delegating: 'Delegating',
      totalDelegation: 'Total Delegation to indexer(s)',
      delegator: 'Delegator',
      currentEra: 'Current Era',
      nextEra: 'Next Era',
    },
  },
};

export type Translations = typeof en;

export default en;
