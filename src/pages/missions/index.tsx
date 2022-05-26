// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { EraProvider, useWeb3, Web3Provider } from '../../containers';
import { Route, Switch } from 'react-router';
import Home from './Mission';
import { useTranslation } from 'react-i18next';
import { AiOutlineUser } from 'react-icons/ai';
import { AppSidebar } from '../../components';
import { WalletRoute } from '../../WalletRoute';
import { User } from './User';
import Leaderboard from './Leaderboard/Leaderboard';

const Container: React.VFC = () => {
  const { t } = useTranslation();

  const sidebarList = [
    {
      label: t('missions.missions'),
      link: `/missions`,
      icon: <AiOutlineUser />,
    },
    {
      label: t('missions.leaderboard'),
      link: '/missions/leaderboard',
      icon: <AiOutlineUser />,
    },
  ];

  return (
    <Web3Provider>
      <EraProvider>
        <AppSidebar list={sidebarList}>
          <Switch>
            <Route path="/missions/leaderboard" component={Leaderboard} />
            <Route path="/missions/user/:id" children={<User />} />
            <WalletRoute path="/missions" component={Home} />
          </Switch>
        </AppSidebar>
      </EraProvider>
    </Web3Provider>
  );
};

export default Container;
