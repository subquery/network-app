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

export function getMonthProgress(timestamp: number): {
  endsIn: string; // Ends in XX days XX hours
  percentageUsed: number; // 47.2%
} {
  const now = dayjs(timestamp);
  const startOfMonth = now.startOf('month');
  const endOfMonth = now.endOf('month');

  const totalMs = endOfMonth.diff(startOfMonth);
  const usedMs = now.diff(startOfMonth);
  const remainingMs = endOfMonth.diff(now);

  const usedPercent = (usedMs / totalMs) * 100;

  const diffDuration = dayjs.duration(remainingMs);
  const days = Math.floor(diffDuration.asDays());
  const hours = diffDuration.hours();
  const minutes = diffDuration.minutes();

  return {
    endsIn: `Ends in ${days.toString().padStart(2, '0')} d ${hours
      .toString()
      .padStart(2, '0')} h ${minutes.toString().padStart(2, '0')} m`,
    percentageUsed: +usedPercent.toFixed(2),
  };
}
