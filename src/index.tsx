// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

// Required because we import @subql/common/dist/project rather than @subql/common
import ReactDOM from 'react-dom';
import TagManager from 'react-gtm-module';
import { Buffer } from 'buffer';

import { App } from './App';
import reportWebVitals from './reportWebVitals';

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

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
