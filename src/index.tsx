// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

// Required because we import @subql/common/dist/project rather than @subql/common
import 'reflect-metadata';
import ReactDOM from 'react-dom';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import TagManager from 'react-gtm-module';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './index.less';

const tagManagerArgs = {
  gtmId: 'G-DK4PX8F61X',
};

const isProd = import.meta.env.NODE_ENV === 'production';
isProd && TagManager.initialize(tagManagerArgs);

Sentry.init({
  dsn: import.meta.env.SENTRY_DSN,
  integrations: [new BrowserTracing()],

  // Set tracesSampleRate to 1.0 to capture 100%
  tracesSampleRate: 1.0,
});

ReactDOM.render(<App />, document.getElementById('root'));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
