// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Breadcrumb } from 'antd';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../../../utils';
import styles from './Withdrawn.module.css';
import { AppPageHeader } from '../../../components';
import { Locked } from './Locked';

// TODO: Confirm with design team for component level
const WithdrawnSubRoutes = () => {
  const { t } = useTranslation();
  return (
    <Breadcrumb separator=">">
      <Breadcrumb.Item href={ROUTES.MY_ACCOUNT_NAV} className={styles.title}>
        {t('indexer.indexers')}
      </Breadcrumb.Item>
      <Breadcrumb.Item className={styles.title}>{t('withdrawals.headerTitle')}</Breadcrumb.Item>
    </Breadcrumb>
  );
};

export const Withdrawn: React.FC<{ delegator: string }> = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.rewardsContainer}>
      <WithdrawnSubRoutes />
      <AppPageHeader title={t('withdrawals.headerTitle')} desc={t('withdrawals.headerDesc')} />
      <Locked />
    </div>
  );
};
