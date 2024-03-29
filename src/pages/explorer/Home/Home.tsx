// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useProjectList } from '@hooks/useProjectList';
import { Typography } from '@subql/components';

import { ROUTES } from '../../../utils';
import styles from './Home.module.css';

const { PROJECT_NAV } = ROUTES;

// TODO move to components
export const Header: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.header}>
      <Typography variant="h3">{t('explorer.home.header')}</Typography>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography style={{ width: 565, marginTop: 16 }} type="secondary">
          {t('explorer.home.headerDesc')}
        </Typography>
      </div>
    </div>
  );
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { listsWithSearch } = useProjectList({
    showTopProject: false,
    onProjectClick: (projectId) => {
      navigate(`${PROJECT_NAV}/${projectId}`);
    },
  });

  return (
    <div className={styles.explorer}>
      <Header />
      {listsWithSearch}
    </div>
  );
};

export default Home;
