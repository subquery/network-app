// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

// i18n must render before App
// eslint-disable-next-line simple-import-sort/imports
import ReactDOM from 'react-dom/client';
import TagManager from 'react-gtm-module';

import './i18n';
import '@subql/components/dist/subquery-components.css';

import './config/polyfill';
import './config/sentryConf';
import './config/dayjsConf';
import 'reflect-metadata';
import './index.less';

import { App } from './App';

const tagManagerArgs = {
  gtmId: 'G-DK4PX8F61X',
};

const isProd = import.meta.env.PROD;
isProd && TagManager.initialize(tagManagerArgs);

const cleanExpiryLocalStorage = () => {
  try {
    Object.keys(localStorage).forEach((key) => {
      const item = localStorage.getItem(key);
      if (item) {
        try {
          const parsed = JSON.parse(item);
          if (parsed.expiry && parsed.expiry < Date.now()) {
            localStorage.removeItem(key);
          }
        } catch (e) {
          // ignore
        }
      }
    });
  } catch (e) {
    // ignore
  }
};

cleanExpiryLocalStorage();

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLDivElement);
root.render(<App></App>);
