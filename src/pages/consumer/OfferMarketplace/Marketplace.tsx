// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { renderAsync } from '@subql/react-hooks';
import { Typography } from 'antd';
import moment from 'moment';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { AppPageHeader, Spinner } from '../../../components';
import { useAllOpenOffers } from '../../../containers';
import { OfferTable } from '../../plans/MyOffers/OfferTable';
import styles from './Marketplace.module.css';

export const Marketplace: React.VFC = () => {
  const { t } = useTranslation();
  const [now] = React.useState<Date>(moment().toDate());
  const offers = useAllOpenOffers({ now: now });

  return renderAsync(offers, {
    loading: () => <Spinner />,
    error: (e) => <Typography>{`Failed to load offers: ${e}`}</Typography>,
    data: (offers) => {
      const { totalCount } = offers.offers || { totalCount: 0 };
      return (
        <div className={styles.container}>
          <AppPageHeader title={t('offerMarket.header')} />
          {totalCount > 1 ? (
            <div className={styles.content}>
              <OfferTable queryFn={useAllOpenOffers} description={t('offerMarket.viewAsIndexer')} />
            </div>
          ) : (
            <></>
          )}
        </div>
      );
    },
  });
};
