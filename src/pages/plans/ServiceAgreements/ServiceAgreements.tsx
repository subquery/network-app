// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { AppPageHeader, TabButtons } from '../../../components';
import { useExpiredServiceAgreements, useServiceAgreements, useWeb3 } from '../../../containers';
import styles from './ServiceAgreements.module.css';
import { Redirect, Route, Switch } from 'react-router';
import { ServiceAgreementsTable } from './ServiceAgreementsTable';
import { Playground } from '../Playrgound';

export const ROUTE = '/plans/service-agreements';
export const ONGOING_PLANS = `${ROUTE}/ongoing`;
export const PLAYGROUND = `${ROUTE}/:indexerId/:deploymentId`;
export const EXPIRED_PLANS = `${ROUTE}/expired`;

const buttonLinks = [
  { label: 'Ongoing', link: ONGOING_PLANS },
  { label: 'Expired', link: EXPIRED_PLANS },
];

const ServiceAgreements: React.VFC = () => {
  const { t } = useTranslation();
  const { account } = useWeb3();

  const Agreements = ({ queryFn }: { queryFn: typeof useServiceAgreements }) => {
    return (
      <div className="contentContainer">
        <ServiceAgreementsTable queryFn={queryFn} queryParams={{ address: account || '' }} />
      </div>
    );
  };

  const SaHeader = () => (
    <>
      <AppPageHeader title={t('plans.category.myServiceAgreement')} />
      <div className={styles.tabs}>
        <TabButtons tabs={buttonLinks} whiteTab />
      </div>
    </>
  );

  return (
    <div>
      <Switch>
        <Route exact path={PLAYGROUND} component={() => <Playground />} />
        <Route
          exact
          path={ONGOING_PLANS}
          component={() => (
            <>
              <SaHeader />
              <Agreements queryFn={useServiceAgreements} />
            </>
          )}
        />
        <Route
          exact
          path={EXPIRED_PLANS}
          component={() => (
            <>
              <SaHeader />
              <Agreements queryFn={useExpiredServiceAgreements} />
            </>
          )}
        />
        <Redirect from={ROUTE} to={ONGOING_PLANS} />
      </Switch>
    </div>
  );
};

export default ServiceAgreements;
