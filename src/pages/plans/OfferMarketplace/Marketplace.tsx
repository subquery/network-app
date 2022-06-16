// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Typography } from 'antd';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { AppPageHeader } from '../../../components';
import { useAllOpenOffers } from '../../../containers';
import { OfferTable } from '../MyOffers/OfferTable';
import styles from './Marketplace.module.css';

export const Marketplace: React.VFC = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <AppPageHeader title={t('OfferMarket.header')} />
      <div className={styles.content}>
        <OfferTable queryFn={useAllOpenOffers} description={t('OfferMarket.viewAsIndexer')} />
      </div>
    </div>
  );
};
