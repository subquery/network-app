// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Typography } from '@subql/react-ui';
import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import styles from './NoPlans.module.css';

export const NoPlans: React.VFC = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.noOffersContainer}>
      <Typography variant="h5">{t('indexerPlans.title')}</Typography>
      <Typography className={styles.description}>
        <Trans i18nKey={'indexerPlans.description'}>
          {t('indexerPlans.description')}
          {/*TODO: add link */}
          <a href="/">here</a>
        </Trans>
      </Typography>
    </div>
  );
};
