// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { renderAsync, useGetAllOpenOffersQuery } from '@subql/react-hooks';
import moment from 'moment';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { AppPageHeader, Spinner } from '../../../components';
import { useWeb3 } from '../../../containers';
import styles from './Marketplace.module.css';
import { Typography } from '@subql/react-ui';
import { OfferTable } from '../../consumer/MyOffers/OfferTable';

const NoOffers: React.VFC = () => {
  const { t } = useTranslation();
  return (
    <div className={styles.noOffersContainer}>
      <Typography variant="h5">{t('consumerOfferMarket.noOffersTitle')}</Typography>
      <Typography className={styles.description}>{t('consumerOfferMarket.noOffers')}</Typography>
    </div>
  );
};

export const Marketplace: React.VFC = () => {
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
      console.log(totalCount);
      return (
        <div className={styles.container}>
          {totalCount <= 0 && (
            <>
              <AppPageHeader title={t('offerMarket.header')} />
              <NoOffers />
            </>
          )}
          {totalCount > 0 && (
            <>
<<<<<<< HEAD
              <AppPageHeader title={t('offerMarket.header')} desc={t('consumerOfferMarket.listDescription')} />
=======
              <AppPageHeader title={t('offerMarket.header')} desc={t('offerMarket.listDescription')} />
>>>>>>> 90a5086 (update OfferTable types, update column mappings, updated Marketplace components)
              <OfferTable queryFn={useGetAllOpenOffersQuery} />
            </>
          )}
        </div>
      );
    },
  });
};
