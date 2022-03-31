// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { EraProvider, SQTokenProvider } from '../../containers';
import { Route, Switch } from 'react-router';
import { Leaderboard } from './Leaderboard';
import { Home } from './Home';
import { useTranslation } from 'react-i18next';
import { AiOutlineUser } from 'react-icons/ai';
import { Sidebar } from '../../components';
import styles from './index.module.css';

const Container: React.VFC = () => {
  const { t } = useTranslation();

  const sidebarList = [
    {
      label: t('missions.missions'),
      link: '/missions',
      icon: <AiOutlineUser />,
      // activeStyle: activeNavLink('indexer/'),
    },
    {
      label: t('missions.leaderboard'),
      link: `/missions/leaderboard`,
      icon: <AiOutlineUser />,
      // activeStyle: activeNavLink(`indexers`),
    },
  ];

  return (
    <EraProvider>
      <SQTokenProvider>
        <div className={styles.container}>
          <div className={styles.sidebar}>
            <Sidebar list={sidebarList} />
          </div>
          <div className={styles.content}>
            <Switch>
              <Route path="/missions/leaderboard" component={Leaderboard} />
              <Route path="/missions" component={Home} />
            </Switch>
          </div>
        </div>
      </SQTokenProvider>
    </EraProvider>
  );
};

export default Container;
