// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

const en = {
  translation: {
    header: {
      explorer: 'Explorer',
      studio: 'Studio',
      documentation: 'Docs',
      github: 'Github',
      connectWallet: 'Connect',
    },
    newProjectCard: {
      title: 'Create a SubQuery project',
      button: 'Create Project',
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
  },
};

export type Translations = typeof en;

export default en;
