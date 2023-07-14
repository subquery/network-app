// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { FC, LazyExoticComponent, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Spinner } from '@subql/components';

import { BasicRouteType, routers } from './routes';

const LazyComponent = (Component: LazyExoticComponent<FC>) => {
  return (
    <Suspense fallback={<Spinner></Spinner>}>
      <Component></Component>
    </Suspense>
  );
};

const renderRoutes: FC<BasicRouteType[]> = (routers) => {
  return (
    <>
      {routers.map((router) => {
        console.log(router.redirect);

        if (router.component || router.redirect) {
          return (
            <Route
              path={router.path}
              key={router.path}
              element={
                <>
                  {router.component ? (
                    LazyComponent(router.component)
                  ) : (
                    <Navigate to={router.redirect as string}></Navigate>
                  )}
                </>
              }
            >
              {router.children && renderRoutes(router.children)}
              {router.redirect && (
                <Route
                  path={router.path}
                  key={router.path}
                  element={<Navigate to={router.redirect}></Navigate>}
                ></Route>
              )}
            </Route>
          );
        }

        // TODO: 404 page.
        return <Route path={router.path} key={router.path} element={<Navigate to="/"></Navigate>}></Route>;
      })}
    </>
  );
};

const RouterComponent: FC = () => {
  return <Routes>{renderRoutes(routers)}</Routes>;
};

export default RouterComponent;
