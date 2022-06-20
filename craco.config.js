// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

module.exports = {
  //   babel: {
  //     plugins: ['@babel/plugin-proposal-class-properties', '@babel/plugin-proposal-private-methods'],
  //   },
  webpack: {
    configure: {
      module: {
        rules: [
          {
            test: /\.js$/,
            // test: /node_modules[/\\]@polkadot*.js$/,
            loader: require.resolve('@open-wc/webpack-import-meta-loader'),
            // loader: '@open-wc/webpack-import-meta-loader',
            exclude: /\.tsx$/,
          },

          // {
          //   test: /\.m?js$/,
          //   include: /node_modules[/\\|]@polkadot/i,
          //   // exclude: /(node_modules|bower_components)/,
          //   use: {
          //     loader: 'babel-loader',
          //     options: {
          //       presets: ['@babel/preset-env', '@babel/preset-react'],
          //       plugins: [
          //         '@babel/plugin-proposal-private-methods',
          //         '@babel/plugin-proposal-class-properties',
          //         '@babel/plugin-proposal-object-rest-spread',
          //       ],
          //     },
          //   },
          // },
        ],
      },
    },

    // resolve: {
    //   fallback: {
    //     path: require.resolve('path-browserify'),
    //     os: require.resolve('os-browserify/browser'),
    //   },
    // },
  },
};
