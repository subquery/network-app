// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { AppPageHeader, TabButtons } from '../../../components';
import { useTranslation } from 'react-i18next';
import styles from './MyOffers.module.css';
import i18next from 'i18next';

const OFFERS_ROUTE = '/plans/my-offers';
const OPEN_OFFERS = `${OFFERS_ROUTE}/open`;
const CLOSE_OFFERS = `${OFFERS_ROUTE}/close`;
const EXPIRED_OFFERS = `${OFFERS_ROUTE}/expired`;
const CREATE_OFFER = `${OFFERS_ROUTE}/create`;

const buttonLinks = [
  { label: i18next.t('myOffers.open'), link: OPEN_OFFERS },
  { label: i18next.t('myOffers.close'), link: CLOSE_OFFERS },
  { label: i18next.t('myOffers.expired'), link: EXPIRED_OFFERS },
];

export const MyOffers: React.VFC = () => {
  const { t } = useTranslation();

  return (
    <div>
      <AppPageHeader title={t('plans.category.manageMyPlans')} />

      <div className={styles.tabs}>
        <TabButtons tabs={buttonLinks} whiteTab />
        <div className={styles.create}></div>
      </div>

      <Switch>
        <Route exact path={OPEN_OFFERS} component={() => <div>OPEN_OFFERS</div>} />
        <Route exact path={CLOSE_OFFERS} component={() => <div>CLOSE_OFFERS</div>} />
        <Route exact path={EXPIRED_OFFERS} component={() => <div>EXPIRED_OFFERS</div>} />
        {/* <Route exact path={CREATE_OFFER} component={() => <div>CREATE_OFFER</div>} /> */}
        <Redirect from={OFFERS_ROUTE} to={OPEN_OFFERS} />
      </Switch>
    </div>
  );
};
