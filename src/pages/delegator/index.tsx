// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Button, Space } from 'antd';
import * as React from 'react';
import { Redirect, Route } from 'react-router';
import { Switch } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BsPeople } from 'react-icons/bs';
import { GiBank } from 'react-icons/gi';
import { AppSidebar } from '../../components';
import { useCurEra, useEra } from '../../stores';
import { ROUTES } from '../../utils';
import { WalletRoute } from '../../WalletRoute';

export const Delegator: React.VFC = () => {
  const curEra = useCurEra();
  const { estEndTime: eraEndTime, actions } = useEra();
  const { t } = useTranslation();

  const sidebarList = [
    {
      label: t('delegate.delegating'),
      link: ROUTES.DELEGATOR,
      icon: <GiBank />,
    },
    {
      label: t('indexer.indexers'),
      link: ROUTES.ALL_INDEXER,
      icon: <BsPeople />,
    },
  ];

  const onUpdateCurERA = () => actions.setCurEra(5);
  const onUpdateERA = () =>
    actions.setEra({
      curEra: 5,
      estEndTime: new Date(),
    });

  return (
    <AppSidebar list={sidebarList}>
      {/* <Switch>
          <Route path={`${INDEXERS_ROUTE}/delegate/:address`} component={DelegateIndexer} />
          <Route path={INDEXERS_ROUTE} component={Indexers} />
          <WalletRoute path={PROFILE_ROUTE} component={Indexer} />
          <Redirect from={ROUTES.DELEGATOR} to={ROUTES.DELEGATOR} />
        </Switch> */}
      Delegator
      <div>Cur ERA:{curEra}</div>
      <div>Era Endtime: {eraEndTime?.toString()}</div>
      <Space>
        <Button onClick={onUpdateCurERA} type="primary">
          Update Cur ERA
        </Button>
        <Button onClick={onUpdateERA} type="primary">
          Update ERA
        </Button>
      </Space>
    </AppSidebar>
  );
};
