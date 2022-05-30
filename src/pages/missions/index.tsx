// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { EraProvider, Web3Provider } from '../../containers';
import { Redirect, Route, Switch } from 'react-router';
import Home from './Mission';
import { useTranslation } from 'react-i18next';
import { AiOutlineCheckSquare, AiOutlineTrophy } from 'react-icons/ai';
import { AppSidebar } from '../../components';
import { WalletRoute } from '../../WalletRoute';
import { User } from './User';
import Leaderboard from './Leaderboard/Leaderboard';

export const ROOT_ROUTE = '/missions';
export const PROFILE_ROUTE = `${ROOT_ROUTE}/my-missions`;
export const LEADERBOARD_ROUTE = `${ROOT_ROUTE}/indexers`;

const Container: React.VFC = () => {
  const { t } = useTranslation();

  const sidebarList = [
    {
      label: t('missions.missions'),
      link: PROFILE_ROUTE,
      icon: <AiOutlineCheckSquare />,
    },
    {
      label: t('missions.leaderboard'),
      link: LEADERBOARD_ROUTE,
      icon: <AiOutlineTrophy />,
    },
  ];

  return (
    <Web3Provider>
      <EraProvider>
        <AppSidebar list={sidebarList}>
          <Switch>
            <Route path="/missions/user/:id" children={<User />} />
            <Route path={LEADERBOARD_ROUTE} component={Leaderboard} />
            <WalletRoute path="/missions/my-missions" component={Home} />
            <Redirect from={ROOT_ROUTE} to={PROFILE_ROUTE} />
          </Switch>
        </AppSidebar>
      </EraProvider>
    </Web3Provider>
  );
};

export default Container;
