// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { AppPageHeader, TabButtons } from '@components';
import { useWeb3 } from '@containers';
import styles from './ServiceAgreements.module.css';
import { Navigate, Route, Routes } from 'react-router';
import { ServiceAgreementsTable } from './ServiceAgreementsTable';
import { ROUTES } from '@utils';
import {
  renderAsync,
  useGetConsumerServiceAgreementsCountQuery,
  useGetIndexerServiceAgreementsCountQuery,
  useGetIndexerOngoingServiceAgreementsQuery,
  useGetIndexerExpiredServiceAgreementsQuery,
  useGetConsumerOngoingServiceAgreementsQuery,
  useGetConsumerExpiredServiceAgreementsQuery,
} from '@subql/react-hooks';
import { Spinner, Typography } from '@subql/react-ui';
import { SAPlayground } from '../Playground';

const { CONSUMER, INDEXER, ONGOING_PLANS, PLAYGROUND, SERVICE_AGREEMENTS, EXPIRED_PLANS } = ROUTES;

type USER_ROLE = 'indexer' | 'consumer';

export type SA_QUERY_FN =
  | typeof useGetIndexerOngoingServiceAgreementsQuery
  | typeof useGetIndexerExpiredServiceAgreementsQuery
  | typeof useGetConsumerOngoingServiceAgreementsQuery
  | typeof useGetConsumerExpiredServiceAgreementsQuery;

const roleMapping = {
  indexer: {
    BASE_ROUTE: `/${INDEXER}`,
    hooks: {
      useTotalCount: useGetIndexerServiceAgreementsCountQuery,
      useOngoingAgreements: useGetIndexerOngoingServiceAgreementsQuery,
      useExpiredAgreements: useGetIndexerExpiredServiceAgreementsQuery,
    },
    intl: {
      noAgreementsDescription: 'serviceAgreements.nonIndexerAgreementsDescription',
      noAgreementsInfoLink: 'serviceAgreements.nonIndexerAgreementsInfoLink',
      noAgreementsLink: '/', //TODO: add link
    },
  },
  consumer: {
    BASE_ROUTE: `/${CONSUMER}`,
    hooks: {
      useTotalCount: useGetConsumerServiceAgreementsCountQuery,
      useOngoingAgreements: useGetConsumerOngoingServiceAgreementsQuery,
      useExpiredAgreements: useGetConsumerExpiredServiceAgreementsQuery,
    },
    intl: {
      noAgreementsDescription: 'serviceAgreements.nonConsumerAgreementsDescription',
      noAgreementsInfoLink: 'serviceAgreements.nonConsumerAgreementsInfoLink',
      noAgreementsLink: '/', //TODO: add link
    },
  },
};

const buttonLinks = (BASE_ROUTE: string) => {
  return [
    { label: 'Ongoing', link: `${BASE_ROUTE}/${SERVICE_AGREEMENTS}/${ONGOING_PLANS}` },
    { label: 'Expired', link: `${BASE_ROUTE}/${SERVICE_AGREEMENTS}/${EXPIRED_PLANS}` },
  ];
};

export const NoAgreements: React.FC<{ USER_ROLE: USER_ROLE }> = ({ USER_ROLE }) => {
  const { t } = useTranslation();
  const { noAgreementsDescription, noAgreementsInfoLink, noAgreementsLink } = roleMapping[USER_ROLE].intl;

  return (
    <>
      <AppPageHeader title={t('plans.category.serviceAgreement')} />
      <div className={styles.noAgreementsContainer}>
        <Typography variant="h5">{t('serviceAgreements.noAgreementsTitle')}</Typography>
        <Typography className={styles.description}>
          <Trans i18nKey={noAgreementsDescription} />
        </Typography>
        <Typography className={styles.infoLink}>
          <Trans i18nKey={noAgreementsInfoLink}>
            {t(noAgreementsInfoLink)}
            <a href={noAgreementsLink}>here</a>
          </Trans>
        </Typography>
      </div>
    </>
  );
};

const Agreements: React.FC<{ queryFn: SA_QUERY_FN; BASE_ROUTE: string; emptyI18nKey?: string }> = ({
  queryFn,
  BASE_ROUTE,
  emptyI18nKey,
}) => {
  const { account } = useWeb3();
  const { t } = useTranslation();

  return (
    <>
      <AppPageHeader title={t('plans.category.serviceAgreement')} />

      <div className={styles.tabs}>
        <TabButtons tabs={buttonLinks(BASE_ROUTE)} whiteTab />
      </div>
      <div className="contentContainer">
        <ServiceAgreementsTable
          queryFn={queryFn}
          queryParams={{ address: account || '' }}
          emptyI18nKey={emptyI18nKey}
        />
      </div>
    </>
  );
};

export const ServiceAgreements: React.FC<{ USER_ROLE: USER_ROLE }> = ({ USER_ROLE }) => {
  const { account } = useWeb3();
  const { BASE_ROUTE } = roleMapping[USER_ROLE];
  const { useTotalCount, useOngoingAgreements, useExpiredAgreements } = roleMapping[USER_ROLE].hooks;

  const serviceAgreements = useTotalCount({ variables: { address: account ?? '' } });

  return renderAsync(serviceAgreements, {
    loading: () => <Spinner />,
    error: (e) => <Typography>{`Failed to load agreements: ${e}`}</Typography>,
    data: (data) => {
      const totalCount = data?.serviceAgreements?.totalCount ?? 0;
      return (
        <Routes>
          <Route path={`${PLAYGROUND}/:saId`} element={<SAPlayground />} />
          <Route
            path={ONGOING_PLANS}
            element={
              <Agreements
                queryFn={useOngoingAgreements}
                BASE_ROUTE={BASE_ROUTE}
                emptyI18nKey={'serviceAgreements.nonOngoing'}
              />
            }
          />
          <Route
            path={EXPIRED_PLANS}
            element={
              <Agreements
                queryFn={useExpiredAgreements}
                BASE_ROUTE={BASE_ROUTE}
                emptyI18nKey={'serviceAgreements.nonOngoing'}
              />
            }
          />
          <Route
            path={'/'}
            element={totalCount <= 0 ? <NoAgreements USER_ROLE={USER_ROLE} /> : <Navigate replace to={ONGOING_PLANS} />}
          />
        </Routes>
      );
    },
  });
};
