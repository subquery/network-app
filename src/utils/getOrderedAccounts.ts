// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as moment from 'moment';
import momentDurationFormatSetup from 'moment-duration-format';
momentDurationFormatSetup(moment);

export const getOrderedAccounts = (
  accounts: Array<any>,
  key: string,
  targetAccount: string | null | undefined,
): Array<any> => {
  if (!targetAccount) return accounts;
  return accounts.sort((accountA, accountB) =>
    accountA[key] === targetAccount ? -1 : accountB[key] === targetAccount ? 1 : 0,
  );
};
