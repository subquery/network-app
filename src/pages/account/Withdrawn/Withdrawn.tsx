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
      <Breadcrumb.Item className={styles.title}>{'Withdrawn'}</Breadcrumb.Item>
    </Breadcrumb>
  );
};

export const Withdrawn: React.FC<{ delegator: string }> = () => {
  return (
    <div className={styles.rewardsContainer}>
      <WithdrawnSubRoutes />
      <AppPageHeader
        title={'Withdrawn'}
        desc={
          'View and withdraw your tokens which have been undelegated or unstaked. The tokens are locked for a short period before they become available for withdrawal. During the locked period you can choose to cancel the withdrawal so the tokens return to their staking/delegating position.'
        }
      />
      <Locked />
    </div>
  );
};
