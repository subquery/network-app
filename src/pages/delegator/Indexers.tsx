// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Redirect, Route, Switch } from 'react-router';
import { useTranslation } from 'react-i18next';
import { AppPageHeader, TabButtons } from '../../components';
import { ROUTES } from '../../utils';
import { TopIndexers } from './TopIndexers';
import { AllIndexers } from './AllIndexers';
import styles from './Indexers.module.css';

const allIndexerRoute = ROUTES.ALL_INDEXERS_DELEGATOR;
const topIndexerRoute = ROUTES.TOP_INDEXERS_DELEGATOR;

const buttonLinks = [
  { label: 'Top 100', link: topIndexerRoute },
  { label: 'All', link: allIndexerRoute },
];

export const Indexers: React.VFC = () => {
  const { t } = useTranslation();

  return (
    <>
      <AppPageHeader title={t('indexer.indexers')} desc={t('topIndexers.desc')} />
      <div>
        <div className={styles.tabList}>
          <TabButtons tabs={buttonLinks} whiteTab />
        </div>

        <Switch>
          <Route path={topIndexerRoute} component={TopIndexers} />
          <Route path={allIndexerRoute} component={AllIndexers} />
          <Redirect from={ROUTES.INDEXERS_DELEGATOR} to={topIndexerRoute} />
        </Switch>
      </div>
    </>
  );
};
