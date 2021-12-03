// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

const en = {
  translation: {
    header: {
      explorer: 'Explorer',
      studio: 'Studio',
      documentation: 'Documentation',
      github: 'Github',
      connectWallet: 'Connect',
    },
    projectCard: {
      noDescription: 'No description',
    },
    studio: {
      create: {
        name: 'Name',
        image: 'Logo',
        subtitle: 'Subtitle',
        description: 'Description',
        websiteUrl: 'Website URL',
        codeUrl: 'Code URL',
      },
    },
    deployment: {
      create: {
        title: 'Create New Deployment',
        version: 'Version',
        description: 'Description',
        deploymentId: 'Deployment ID',
        explainer: 'You can get a deployment id by running `subqul publish` from the command line',
        submit: 'Deploy',
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
    connectWallet: {
      title: 'Connect wallet to use the studio',
      subtitle:
        'Use the studio to create and manage your SubQuery projects.<br/>Learn how to create a SubQuery project <1>here</1>.',
      connectWith: 'Connect With:',
      metamaskDesc: 'Connect with Metamask browser extension',
    },
  },
};

export type Translations = typeof en;

export default en;
