// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Breadcrumb } from 'antd';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../../../utils';
import styles from './Withdrawn.module.css';
import { AppPageHeader } from '../../../components';
import { Locked } from './Locked';
import { BreadcrumbNav } from '@components';

export const Withdrawn: React.FC<{ delegator: string }> = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.rewardsContainer}>
      <BreadcrumbNav
        BACKLINK={`/${ROUTES.MY_ACCOUNT_NAV}`}
        backLinkText={t('indexer.indexers')}
        childText={t('withdrawals.headerTitle')}
      />
      <AppPageHeader title={t('withdrawals.headerTitle')} desc={t('withdrawals.headerDesc')} />
      <Locked />
    </div>
  );
};
