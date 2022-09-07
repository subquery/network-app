// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './Home.module.css';
import { Redirect, Route, Switch } from 'react-router';
import { MockedProvider } from '@apollo/react-testing';
import { AppPageHeader, TabButtons } from '../../../../components';
import { TopIndexers } from '../TopIndexers';
import { AllIndexers } from '../AllIndexers';
import { topIndexersMock } from '../../../../containers/QueryTop100Indexers';

const INDEXERS_ROUTE = `/staking/indexers`;
const ALL_INDEXERS_ROUTE = `${INDEXERS_ROUTE}/all`;
const TOP_INDEXERS_ROUTE = `${INDEXERS_ROUTE}/top-100`;

const buttonLinks = [
  { label: 'Top 100', link: TOP_INDEXERS_ROUTE },
  { label: 'All', link: ALL_INDEXERS_ROUTE },
];

export const Home: React.VFC = () => {
  const { t } = useTranslation();

  return (
    <>
      <AppPageHeader title={t('indexer.indexers')} />

      <div>
        <div className={styles.tabList}>
          <TabButtons tabs={buttonLinks} whiteTab />
        </div>

        <Switch>
          <Route
            exact
            path={TOP_INDEXERS_ROUTE}
            component={() => (
              <MockedProvider mocks={topIndexersMock}>
                <TopIndexers />
              </MockedProvider>
            )}
          />
          <Route exact path={ALL_INDEXERS_ROUTE} component={AllIndexers} />
          <Redirect from={INDEXERS_ROUTE} to={TOP_INDEXERS_ROUTE} />
        </Switch>
      </div>
    </>
  );
};
