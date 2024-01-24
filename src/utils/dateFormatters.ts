// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import dayjs from 'dayjs';

export const secondsToDays = (seconds: number): number => {
  return Number.parseFloat(dayjs.duration(seconds, 'seconds').asDays().toPrecision(4));
};

export const formatSecondsDuration = (seconds: number, formatStr?: string): string => {
  const formatted = dayjs.duration(seconds, 'seconds');

  return formatted.format(formatStr ?? 'D [days], H [hrs], m [mins]').replace(/(^0 [a-z]+, )|(, 0 [a-z]+)+/g, '');
};

export const formatDate = (date: Date): string => {
  return dayjs.utc(date).local().format('dddd, MMMM Do YYYY, h:mm:ss a');
};

export const getTimeLeft = (mNow: dayjs.Dayjs, mTo: dayjs.Dayjs): string => {
  if (mNow.isAfter(mTo)) return 'This period is over';
  return dayjs.duration(mTo.diff(mNow)).format('DD [d] HH [h] mm [m]');
};

export const getProgress = (now: Date, from: Date, to: Date): number => {
  return parseInt(((Math.abs(now.getTime() - from.getTime()) / (to.getTime() - from.getTime())) * 100).toFixed(0));
};
