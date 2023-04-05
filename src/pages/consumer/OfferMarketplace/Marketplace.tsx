// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { renderAsync, useGetAllOpenOffersQuery } from '@subql/react-hooks';
import moment from 'moment';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { AppPageHeader, Description, EmptyList, Spinner } from '@components';
import { useWeb3 } from '../../../containers';
import { Typography } from '@subql/components';
import { OfferTable } from '../../consumer/MyOffers/OfferTable';
import styles from './Marketplace.module.css';
import { ROUTES } from '@utils';
import { useLocation } from 'react-router-dom';

const { INDEXER_OFFER_MARKETPLACE_NAV } = ROUTES;

const NoOffers: React.FC = () => {
  const { pathname } = useLocation();
  const { t } = useTranslation();

  if (pathname === INDEXER_OFFER_MARKETPLACE_NAV) {
    return (
      <EmptyList
        title={t('indexerOfferMarket.noOffersTitle')}
        infoI18nKey={'indexerOfferMarket.noOffers'}
        infoLinkDesc={t('myOffers.noOffersInfoLink')}
      />
    );
  }

  return <EmptyList title={t('consumerOfferMarket.noOffersTitle')} description={t('consumerOfferMarket.noOffers')} />;
};

export const Marketplace: React.FC = () => {
  const { t } = useTranslation();
  const [now] = React.useState<Date>(moment().toDate());
  const { account } = useWeb3();
  const offers = useGetAllOpenOffersQuery({ variables: { now: now, offset: 0 } });

  React.useEffect(() => {
    offers.refetch();
  }, [offers, account]);

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
                <OfferTable queryFn={useGetAllOpenOffersQuery} />
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
