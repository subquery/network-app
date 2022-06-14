// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Redirect, Route, Switch, useHistory } from 'react-router-dom';
import { AppPageHeader, TabButtons } from '../../../components';
import { useTranslation } from 'react-i18next';
import styles from './MyOffers.module.css';
import i18next from 'i18next';
import { CreateOffer } from './CreateOffer';
import { Button } from '../../../components/Button';
import { useOwnExpiredOffers, useOwnFinishedOffers, useOwnOpenOffers, useWeb3 } from '../../../containers';
import { MyOffersTable } from './MyOfferTable';

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

export const OfferHeader: React.VFC = () => {
  const { t } = useTranslation();
  const history = useHistory();

  return (
    <>
      <AppPageHeader title={t('plans.category.manageMyPlans')} />

      <div className={styles.tabs}>
        <TabButtons tabs={buttonLinks} whiteTab />
        <div className={styles.create}>
          <Button onClick={() => history.push(CREATE_OFFER)}>{t('myOffers.createOffer')}</Button>
        </div>
      </div>
    </>
  );
};

export const MyOffers: React.VFC = () => {
  const { account } = useWeb3();
  const MyOffers = ({ queryFn }: { queryFn: typeof useOwnOpenOffers }) => {
    return (
      <div className="contentContainer">
        <MyOffersTable queryFn={queryFn} queryParams={{ consumer: account || '' }} />
      </div>
    );
  };

  return (
    <Switch>
      <Route
        exact
        path={OPEN_OFFERS}
        component={() => (
          <>
            <OfferHeader />
            <MyOffers queryFn={useOwnOpenOffers} />
          </>
        )}
      />
      <Route
        exact
        path={CLOSE_OFFERS}
        component={() => (
          <>
            <OfferHeader />
            <MyOffers queryFn={useOwnFinishedOffers} />
          </>
        )}
      />
      <Route
        exact
        path={EXPIRED_OFFERS}
        component={() => (
          <>
            <OfferHeader />
            <MyOffers queryFn={useOwnExpiredOffers} />
          </>
        )}
      />
      <Route exact path={CREATE_OFFER} component={CreateOffer} />
      <Redirect from={OFFERS_ROUTE} to={OPEN_OFFERS} />
    </Switch>
  );
};
