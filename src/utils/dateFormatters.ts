// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as moment from 'moment';
import momentDurationFormatSetup from 'moment-duration-format';
momentDurationFormatSetup(moment);

export const secondsToDays = (seconds: number): number => {
  return Number.parseFloat(moment.duration(seconds, 'seconds').asDays().toPrecision(4));
};

export const formatSecondsDuration = (seconds: number, formatStr?: string): string => {
  return moment.duration(seconds, 'seconds').format(formatStr ?? 'd [days], h [hrs], m [mins]', {
    trim: 'all',
  });
};

export const formatDate = (date: Date): string => {
  return moment.utc(date).local().format('dddd, MMMM Do YYYY, h:mm:ss a');
};

export const getTimeLeft = (mNow: moment.Moment, mTo: moment.Moment): string => {
  if (mNow.isAfter(mTo)) return 'This period is over';
  return moment.duration(mTo.diff(mNow)).format('DD [d] hh [h] mm [m]');
};

export const getProgress = (now: Date, from: Date, to: Date): number => {
  return parseInt(((Math.abs(now.getTime() - from.getTime()) / (to.getTime() - from.getTime())) * 100).toFixed(0));
};
