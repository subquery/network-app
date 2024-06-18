// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

export const getOrderedAccounts = <T extends any[], K extends keyof T[number]>(
  accounts: T,
  key: K,
  targetAccount: string | null | undefined,
): T => {
  if (!targetAccount) return accounts;
  return accounts.sort((accountA, accountB) =>
    accountA[key] === targetAccount ? -1 : accountB[key] === targetAccount ? 1 : 0,
  );
};
