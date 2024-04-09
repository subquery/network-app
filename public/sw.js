// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

importScripts('https://static.subquery.network/sw/workbox-sw.js');

workbox.setConfig({
  modulePathPrefix: 'https://static.subquery.network/sw',
});

// https://developers.google.com/web/tools/workbox/reference-docs/latest/workbox.routing#registerRoute
workbox.routing.registerRoute(
  // \/{0,1} will also match dev.thechaindata.comxxxyyy, but this is would not a valid suffix, so it can be use.
  // for match dev.thechaindata.com & dev.thechaindata.com/
  /(((dev|kepler)\.thechaindata\.com)|(app\.subquery\.network))\/{0,1}(?=((dashboard)|(explorer)|(profile)|(indexer)|(delegator)|(consumer)|(swap)|(studio))|\?|$).*/g,
  // https://developers.google.com/web/tools/workbox/reference-docs/latest/workbox.strategies
  new workbox.strategies.NetworkFirst({
    cacheName: 'workbox:html',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxAgeSeconds: 3600 * 24 * 7,
      }),
    ],
  }),
);

workbox.routing.registerRoute(
  /\.js(?!\.json)(?=\?|$)/,
  new workbox.strategies.CacheFirst({
    cacheName: 'workbox:js',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxAgeSeconds: 3600 * 24 * 30,
      }),
    ],
  }),
);

workbox.routing.registerRoute(
  /\.css/,
  new workbox.strategies.CacheFirst({
    cacheName: 'workbox:css',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxAgeSeconds: 3600 * 24 * 30,
      }),
    ],
  }),
);

workbox.routing.registerRoute(
  // Cache image files
  /.+\.(?:png|jpg|jpeg|svg|gif|ico|ttf)/,
  // Use the cache if it's available
  new workbox.strategies.StaleWhileRevalidate({
    // Use a custom cache name
    cacheName: 'workbox:image',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxAgeSeconds: 3600 * 24 * 30,
      }),
    ],
  }),
);
