// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { AppPageHeader, TabButtons } from '../../../components';
import { useExpiredServiceAgreements, useServiceAgreements, useWeb3 } from '../../../containers';
import styles from './ServiceAgreements.module.css';
import { Redirect, Route, Switch } from 'react-router';
import { ServiceAgreementsTable } from './ServiceAgreementsTable';
import { SAPlayground } from '../Playground';
import { SERVICE_AGREEMENTS } from '..';

export const ONGOING_PLANS = `${SERVICE_AGREEMENTS}/ongoing`;
export const PLAYGROUND = `${SERVICE_AGREEMENTS}/playground`;
export const EXPIRED_PLANS = `${SERVICE_AGREEMENTS}/expired`;

const buttonLinks = [
  { label: 'Ongoing', link: ONGOING_PLANS },
  { label: 'Expired', link: EXPIRED_PLANS },
];

const ServiceAgreements: React.VFC = () => {
  const { t } = useTranslation();
  const { account } = useWeb3();

  const Agreements = ({ queryFn, emptyI18nKey }: { queryFn: typeof useServiceAgreements; emptyI18nKey?: string }) => {
    return (
      <div className="contentContainer">
        <ServiceAgreementsTable
          queryFn={queryFn}
          queryParams={{ address: account || '' }}
          emptyI18nKey={emptyI18nKey}
        />
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
        <Route exact path={`${PLAYGROUND}/:saId`} component={() => <SAPlayground />} />
        <Route
          exact
          path={ONGOING_PLANS}
          component={() => (
            <>
              <SaHeader />
              <Agreements queryFn={useServiceAgreements} emptyI18nKey={'serviceAgreements.nonOngoing'} />
            </>
          )}
        />
        <Route
          exact
          path={EXPIRED_PLANS}
          component={() => (
            <>
              <SaHeader />
              <Agreements queryFn={useExpiredServiceAgreements} emptyI18nKey={'serviceAgreements.nonExpired'} />
            </>
          )}
        />
        <Redirect from={SERVICE_AGREEMENTS} to={ONGOING_PLANS} />
      </Switch>
    </div>
  );
};

export default ServiceAgreements;
