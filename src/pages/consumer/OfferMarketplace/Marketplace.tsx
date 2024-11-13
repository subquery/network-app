// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { AppPageHeader } from '@components/AppPageHeader';
import { Description } from '@components/Description';
import { EmptyList } from '@components/EmptyList';
import { Spinner, Typography } from '@subql/components';
import { renderAsync, useGetAllOpenOffersLazyQuery, useGetAllOpenOffersQuery } from '@subql/react-hooks';
import { ROUTES, URLS } from '@utils';
import dayjs from 'dayjs';

import { OfferTable } from '../../consumer/MyOffers/OfferTable';
import styles from './Marketplace.module.css';

const { INDEXER_OFFER_MARKETPLACE_NAV } = ROUTES;

const NoOffers: React.FC = () => {
  const { pathname } = useLocation();
  const { t } = useTranslation();

  if (pathname === INDEXER_OFFER_MARKETPLACE_NAV) {
    return (
      <EmptyList
        title={t('indexerOfferMarket.noOffersTitle')}
        description={t('indexerOfferMarket.noOffers')}
        infoI18nKey={t('indexerOfferMarket.learnMore')}
        infoLinkDesc={t('indexerOfferMarket.learnMore')}
        infoLink={URLS.OFFER_MARKETPLACE}
      />
    );
  }

  return <EmptyList title={t('consumerOfferMarket.noOffersTitle')} description={t('consumerOfferMarket.noOffers')} />;
};

export const Marketplace: React.FC = () => {
  const { t } = useTranslation();
  const [now] = React.useState<Date>(dayjs().toDate());
  const offers = useGetAllOpenOffersQuery({ variables: { now: now, offset: 0 } });

  return renderAsync(offers, {
    loading: () => <Spinner />,
    error: (e) => <Typography>{`Failed to load offers: ${e}`}</Typography>,
    data: (offers) => {
      const { totalCount } = offers.offers || { totalCount: 0 };

      return (
        <div>
          <AppPageHeader title={t('offerMarket.header')} />
          {totalCount > 0 ? (
            <>
              <Description desc={t('consumerOfferMarket.listDescription')} />
              <div className={styles.offers}>
                <OfferTable queryFn={useGetAllOpenOffersLazyQuery} />
              </div>
            </>
          ) : (
            <NoOffers />
          )}
        </div>
      );
    },
  });
};

export default Marketplace;
