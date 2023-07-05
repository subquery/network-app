// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { FC, LazyExoticComponent, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Spinner } from '@subql/components';

import { routers } from './routes';

const LazyComponent = (Component: LazyExoticComponent<FC>) => {
  return (
    <Suspense fallback={<Spinner></Spinner>}>
      <Component></Component>
    </Suspense>
  );
};

const RouterComponent: FC = () => {
  return (
    <Routes>
      {routers.map((router) => {
        return <Route path={router.path} key={router.path} element={LazyComponent(router.component)}></Route>;
      })}
    </Routes>
  );
};

export default RouterComponent;
