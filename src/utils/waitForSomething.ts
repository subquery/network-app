// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { parseError } from '@utils';

export const sleep = (time = 2000) => new Promise((resolve) => setTimeout(resolve, time));

interface waitForSomethingArg {
  func: () => boolean | PromiseLike<boolean>;
  timeout?: number;
  splitTime?: number;
}

export const waitForSomething = async (
  { func, timeout, splitTime = 50 }: waitForSomethingArg,
  sleepTime = 0,
): Promise<boolean> => {
  if (timeout && sleepTime >= timeout) {
    return false;
  }
  try {
    const r = await func();

    if (r) {
      return r;
    }
  } catch (e) {
    parseError(e);
  }

  await sleep(splitTime);

  return waitForSomething({ func, timeout, splitTime }, splitTime + sleepTime);
};
