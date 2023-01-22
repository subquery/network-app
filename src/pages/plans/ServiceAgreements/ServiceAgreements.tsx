// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { AppPageHeader, TabButtons } from '../../../components';
import { useExpiredServiceAgreements, useServiceAgreements, useWeb3 } from '../../../containers';
import styles from './ServiceAgreements.module.css';
import { Navigate, Route, Routes } from 'react-router';
import { ServiceAgreementsTable } from './ServiceAgreementsTable';
import { SAPlayground } from '../Playground';

export const ONGOING_PLANS = `ongoing`;
export const PLAYGROUND = `playground`;
export const EXPIRED_PLANS = `expired`;

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
      <SaHeader />
      <Routes>
        <Route path={`${PLAYGROUND}/:saId`} element={<SAPlayground />} />
        <Route
          path={ONGOING_PLANS}
          element={<Agreements queryFn={useServiceAgreements} emptyI18nKey={'serviceAgreements.nonOngoing'} />}
        />
        <Route
          path={EXPIRED_PLANS}
          element={<Agreements queryFn={useExpiredServiceAgreements} emptyI18nKey={'serviceAgreements.nonExpired'} />}
        />
        <Route path={'/'} element={<Navigate replace to={ONGOING_PLANS} />} />
      </Routes>
    </div>
  );
};

export default ServiceAgreements;
