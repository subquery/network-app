// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import { FC, LazyExoticComponent, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Spinner } from '@subql/components';

import { BasicRouteType, routers } from './routes';

const LazyComponent = (Component: LazyExoticComponent<FC>) => {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100vh',
            minWidth: '100vw',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Spinner></Spinner>
        </div>
      }
    >
      <Component></Component>
    </Suspense>
  );
};

const renderRoutes: FC<{ routers: BasicRouteType[]; parentPath?: string }> = ({ routers, parentPath = '' }) => {
  return (
    <>
      {routers.map((router) => {
        if (router.component || router.redirect) {
          return (
            <Route
              path={router.path}
              key={router.path}
              element={
                // Support that just have redirect field
                <>
                  {router.component ? (
                    LazyComponent(router.component)
                  ) : (
                    <Navigate to={router.redirect as string}></Navigate>
                  )}
                </>
              }
            >
              {router.children && renderRoutes({ routers: router.children, parentPath: router.path })}
              {/* Support that have some common part share to all children components and then redirect to a exact children to work */}
              {router.redirect && (
                <Route
                  path={`${parentPath}${router.path.startsWith('/') ? router.path : `/${router.path}`}`}
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
  return <Routes>{renderRoutes({ routers })}</Routes>;
};

export default RouterComponent;
