// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

const CracoLessPlugin = require('craco-less');

module.exports = {
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: { '@primary-color': '#4388dd', '@text-color': '#454f58', '@text-color-secondary': '#919eab' },
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
};
