// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

// i18n must render before App
// eslint-disable-next-line simple-import-sort/imports
import ReactDOM from 'react-dom/client';
import TagManager from 'react-gtm-module';
import { Buffer } from 'buffer';

import './i18n';
import '@subql/components/dist/subquery-components.css';

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

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLDivElement);
root.render(<App></App>);
