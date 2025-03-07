// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useRouteQuery } from '@hooks';
import { useProjectList } from '@hooks/useProjectList';
import { Typography } from '@subql/components';
import { ProjectType } from '@subql/network-query';

import styles from './Home.module.css';

// TODO move to components
export const Header: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.header}>
      <Typography style={{ width: 'max-content' }} variant="h3">
        {t('explorer.home.header')}
      </Typography>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography className={styles.typographySecondary} type="secondary" style={{ textAlign: 'center' }}>
          {t('explorer.home.headerDesc')}
        </Typography>
      </div>
    </div>
  );
};

const Home: React.FC = () => {
  const query = useRouteQuery();

  const { listsWithSearch } = useProjectList({
    showTopProject: false,
    defaultFilterProjectType: query.get('category') === 'rpc' ? ProjectType.RPC : ProjectType.SUBQUERY,
  });

  return (
    <div>
      <div className={styles.explorer}>
        <Header />
        {listsWithSearch}
      </div>
    </div>
  );
};

export default Home;
