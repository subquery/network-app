// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import styles from './NoIndexers.module.css';

const NoIndexers: React.VFC = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <div className={styles.preContainer}>
        <i className={['bi-search', styles.search].join(' ')} role="img" aria-label="search" />
        <span className={styles.preTitle}>{t('noIndexers.preTitle')}</span>
      </div>
      <span className={styles.title}>{t('noIndexers.title')}</span>
      <div>
        <Trans i18nKey="noIndexers.subtitle" className={styles.subtitle}>
          Learn how to index a subquery <a href={'/'}>here</a>
          {/*TODO use correct link*/}
        </Trans>
      </div>
    </div>
  );
};

export default NoIndexers;
