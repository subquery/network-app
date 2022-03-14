// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

const errorCodeMapping: Record<string, string> = {
  '-32603': 'Your address has not registered yet.',
};

export function parseError(error: any): string {
  if (error?.data) {
    const errorCode = error?.data.code;
    if (errorCode && errorCodeMapping[errorCode]) {
      return errorCodeMapping[errorCode];
    } else if (error?.data.message) {
      return error?.data.message;
    }
  }

  if (error?.message) {
    return error?.message;
  }
  return 'Error!';
}
