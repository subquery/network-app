// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

const errorCodeMapping: Record<string, string> = {
  notRegister: 'Your address has not registered yet.',
};

export function parseError(error: any): string {
  if (error?.data?.message) {
    if (error?.data.message.includes('revert Not registered')) {
      return errorCodeMapping['notRegister'];
    } else {
      return error?.data.message;
    }
  }

  if (error?.message) {
    return error?.message;
  }
  return 'Error!';
}
