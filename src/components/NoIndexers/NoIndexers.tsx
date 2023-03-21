// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Typography } from '@subql/react-ui';
import clsx from 'clsx';
import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import styles from './NoIndexers.module.css';

const NoIndexers: React.VFC = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <div className={styles.preContainer}>
        <Typography variant="medium" className={styles.preTitle}>
          {t('noIndexers.preTitle')}
        </Typography>
        <i className={clsx('bi-search', styles.search)} role="img" aria-label="search" />
      </div>
      <Typography variant="h5" className={styles.title}>
        {t('noIndexers.title')}
      </Typography>
      <Typography variant="medium">
        <Trans i18nKey="noIndexers.subtitle">
          Learn how to index a subquery project{' '}
          <a href={'https://academy.subquery.network/subquery_network/indexers.html'} target="_blank" rel="noreferrer">
            here
          </a>
        </Trans>
      </Typography>
    </div>
  );
};

export default NoIndexers;
