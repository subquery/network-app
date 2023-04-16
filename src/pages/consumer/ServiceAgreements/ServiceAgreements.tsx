// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { AppPageHeader, EmptyList, TabButtons } from '@components';
import { useWeb3 } from '@containers';
import styles from './ServiceAgreements.module.css';
import { Navigate, Route, Routes } from 'react-router';
import { ServiceAgreementsTable } from './ServiceAgreementsTable';
import { ROUTES, URLS } from '@utils';
import {
  renderAsync,
  useGetConsumerServiceAgreementsCountQuery,
  useGetIndexerServiceAgreementsCountQuery,
  useGetIndexerOngoingServiceAgreementsQuery,
  useGetIndexerExpiredServiceAgreementsQuery,
  useGetConsumerOngoingServiceAgreementsQuery,
  useGetConsumerExpiredServiceAgreementsQuery,
} from '@subql/react-hooks';
import { Spinner, Typography } from '@subql/components';
import { SAPlayground } from '../Playground';
import { t } from 'i18next';

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
      noAgreementsDescription: [
        'serviceAgreements.nonIndexerAgreementsDescription_0',
        'serviceAgreements.nonIndexerAgreementsDescription_1',
      ],
      noAgreementsInfoLink: 'serviceAgreements.nonIndexerAgreementsInfoLink',
      noAgreementsLink: URLS.PLANS_OFFERS,
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
      noAgreementsDescription: [
        t('serviceAgreements.nonConsumerAgreementsDescription_0'),
        t('serviceAgreements.nonConsumerAgreementsDescription_1'),
      ],
      noAgreementsInfoLink: 'serviceAgreements.nonConsumerAgreementsInfoLink',
      noAgreementsLink: URLS.PLANS_OFFERS,
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
  const { noAgreementsDescription, noAgreementsInfoLink, noAgreementsLink } = roleMapping[USER_ROLE].intl;

  return (
    <>
      <AppPageHeader title={t('plans.category.serviceAgreement')} />
      <EmptyList
        title={t('serviceAgreements.noAgreementsTitle')}
        description={noAgreementsDescription}
        infoI18nKey={noAgreementsInfoLink}
        infoLink={noAgreementsLink}
      />
    </>
  );
};

const Agreements: React.FC<{
  queryFn: SA_QUERY_FN;
  BASE_ROUTE: string;
  emptyI18nKey?: string;
  totalCount: number;
  userRole: USER_ROLE;
}> = ({ queryFn, BASE_ROUTE, emptyI18nKey, totalCount, userRole }) => {
  const { account } = useWeb3();
  const { t } = useTranslation();
  const { noAgreementsDescription, noAgreementsInfoLink, noAgreementsLink } = roleMapping[userRole].intl;

  return (
    <>
      <AppPageHeader title={t('plans.category.serviceAgreement')} desc={t('serviceAgreements.agreementsDescription')} />

      {totalCount <= 0 && (
        <EmptyList
          title={t('serviceAgreements.noAgreementsTitle')}
          description={noAgreementsDescription.map((tKey) => t(tKey))}
          infoI18nKey={noAgreementsInfoLink}
          infoLinkDesc={t(noAgreementsInfoLink)}
          infoLink={noAgreementsLink}
        />
      )}

      {totalCount > 0 && (
        <>
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
      )}
    </>
  );
};

export const ServiceAgreements: React.FC<{ USER_ROLE: USER_ROLE }> = ({ USER_ROLE }) => {
  const { account } = useWeb3();
  const { BASE_ROUTE } = roleMapping[USER_ROLE];
  const { useTotalCount, useOngoingAgreements, useExpiredAgreements } = roleMapping[USER_ROLE].hooks;
  const serviceAgreements = useTotalCount({ variables: { address: account ?? '' } });

  function parseErrors(e: Error) {
    throw new Error('Function not implemented.');
  }

  return renderAsync(serviceAgreements, {
    loading: () => <Spinner />,
    error: (e) => <Typography>{`Failed to load agreements: ${parseErrors(e)}`}</Typography>,
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
                totalCount={totalCount}
                userRole={USER_ROLE}
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
                totalCount={totalCount}
                userRole={USER_ROLE}
              />
            }
          />
          <Route path={'/'} element={<Navigate replace to={ONGOING_PLANS} />} />
        </Routes>
      );
    },
  });
};
