// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

// eslint-disable-next-line simple-import-sort/imports
import ReactDOM from 'react-dom';
import TagManager from 'react-gtm-module';
import { Buffer } from 'buffer';

import './i18n';

import { App } from './App';

import './config/sentryConf';
import 'reflect-metadata';
import './index.less';

window.Buffer = Buffer;

const tagManagerArgs = {
  gtmId: 'G-DK4PX8F61X',
};

const isProd = import.meta.env.PROD;
isProd && TagManager.initialize(tagManagerArgs);

ReactDOM.render(<App />, document.getElementById('root'));
