// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import moment from 'moment';

export const secondsToDhms = (seconds: number): string => {
  return moment.duration(seconds, 'seconds').humanize(true);
};

export const secondsToDays = (seconds: number): number => {
  return Number.parseFloat(moment.duration(seconds, 'seconds').asDays().toPrecision(4));
};
