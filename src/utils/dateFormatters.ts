// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import moment from 'moment';

export const secondsToDhms = (seconds: number): string => {
  return moment.duration(seconds, 'seconds').humanize(true);
};

export const secondsToDays = (seconds: number): number => {
  return Number.parseFloat(moment.duration(seconds, 'seconds').asDays().toPrecision(4));
};

// TODO: Improve as designer require
export const formatSeconds = (seconds: number): string => {
  return moment.utc(moment.duration(seconds, 'seconds').asMilliseconds()).format('hh [hours] mm [mins] ss [secs]');
};
