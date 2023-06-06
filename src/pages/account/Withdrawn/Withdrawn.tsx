// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { BreadcrumbNav } from '@components';

import { AppPageHeader } from '../../../components';
import { ROUTES } from '../../../utils';
import { Locked } from './Locked';
import styles from './Withdrawn.module.css';

export const Withdrawn: React.FC<{ delegator: string }> = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.rewardsContainer}>
      <BreadcrumbNav
        backLink={`${ROUTES.MY_ACCOUNT_NAV}`}
        backLinkText={t('indexer.indexers')}
        childText={t('withdrawals.headerTitle')}
      />
      <AppPageHeader
        title={t('withdrawals.headerTitle')}
        desc={[t('withdrawals.headerDesc_1'), t('withdrawals.headerDesc_2')]}
      />
      <Locked />
    </div>
  );
};
