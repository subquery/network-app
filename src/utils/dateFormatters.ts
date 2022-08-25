// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as moment from 'moment';
import momentDurationFormatSetup from 'moment-duration-format';
momentDurationFormatSetup(moment);

export const secondsToDays = (seconds: number): number => {
  return Number.parseFloat(moment.duration(seconds, 'seconds').asDays().toPrecision(4));
};

export const formatSecondsDuration = (seconds: number): string => {
  return moment.duration(seconds, 'seconds').format('d [days], h [hrs], m [mins]', {
    trim: 'all',
  });
};

export const formatDate = (date: Date): string => {
  return moment.utc(date).local().format('dddd, MMMM Do YYYY, h:mm:ss a');
};

export const getPeriod = (mTo: moment.Moment, mNow: moment.Moment): string => {
  if (mNow.isAfter(mTo)) {
    return '0d 0h 0m 0s';
  }

  const duration = moment.duration(mTo.diff(mNow));
  const days = Math.floor(duration.asDays());
  duration.subtract(moment.duration(days, 'days'));

  const hours = duration.hours();
  duration.subtract(moment.duration(hours, 'hours'));

  const minutes = duration.minutes();
  duration.subtract(moment.duration(minutes, 'minutes'));

  return `${days}d ${hours}h ${minutes}m`;
};

export const getProgress = (now: Date, from: Date, to: Date): number => {
  return parseInt(((Math.abs(now.getTime() - from.getTime()) / (to.getTime() - from.getTime())) * 100).toFixed(0));
};
