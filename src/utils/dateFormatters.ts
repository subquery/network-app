// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as moment from 'moment';
import momentDurationFormatSetup from 'moment-duration-format';
momentDurationFormatSetup(moment);

export const secondsToDays = (seconds: number): number => {
  return Number.parseFloat(moment.duration(seconds, 'seconds').asDays().toPrecision(4));
};

export const formatSecondsDuration = (seconds: number): string => {
  return moment.duration(seconds, 'seconds').format('d [days], h [hrs], m [mins]');
};

export const formatDate = (date: Date): string => {
  return moment.utc(date).local().format('dddd, MMMM Do YYYY, h:mm:ss a');
};
