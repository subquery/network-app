// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { EraProvider } from '../../containers';
import { Redirect, Route, Switch } from 'react-router';
import { useTranslation } from 'react-i18next';
import { AiOutlineCheckSquare, AiOutlineTrophy } from 'react-icons/ai';
import { AppSidebar } from '../../components';
import { Participant } from './Participant';
import { Leaderboard } from './Leaderboard';
import { Home } from './Mission';
import { LEADERBOARD_ROUTE, MISSION_ROUTE, ROOT_ROUTE } from './constants';
import { WalletRoute } from '../../WalletRoute';

export const Missions: React.VFC = () => {
  const { t } = useTranslation();

  const sidebarList = [
    {
      label: t('missions.missions'),
      link: MISSION_ROUTE,
      icon: <AiOutlineCheckSquare />,
    },
    {
      label: t('missions.leaderboard'),
      link: LEADERBOARD_ROUTE,
      icon: <AiOutlineTrophy />,
    },
  ];

  return (
    <EraProvider>
      <AppSidebar list={sidebarList}>
        <Switch>
          <Route path={LEADERBOARD_ROUTE} component={Leaderboard} />
          <Route path={`${MISSION_ROUTE}/:season/:account`} children={<Participant />} />
          <WalletRoute path={MISSION_ROUTE} component={Home} />
          <Redirect from={ROOT_ROUTE} to={MISSION_ROUTE} />
        </Switch>
      </AppSidebar>
    </EraProvider>
  );
};
