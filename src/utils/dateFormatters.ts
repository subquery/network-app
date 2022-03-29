// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import i18next from '../i18n';

export const secondsToDhms = (seconds: number): string => {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const dDisplay = d > 0 ? i18nPlurals('time.day', d) : '';
  const hDisplay = h > 0 ? i18nPlurals('time.hour', h) : '';
  const mDisplay = m > 0 ? i18nPlurals('time.minute', m) : '';
  const sDisplay = s > 0 ? i18nPlurals('time.minute', s) : '';
  return (dDisplay + hDisplay + mDisplay + sDisplay).replace(/,\s*$/, '');
};

export const i18nPlurals = (key: string, val: number): string => {
  return i18next.t(key, { count: val });
};
