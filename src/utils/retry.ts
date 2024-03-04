// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

export const retry = (
  func: () => void,
  options?: {
    sleepTime?: number;
    retryTime?: number;
  },
) => {
  const { sleepTime = 3000, retryTime = 5 } = options || {};
  let times = 0;

  const clear = setInterval(() => {
    func();
    times += 1;
    if (times === retryTime) {
      clearInterval(clear);
    }
  }, sleepTime);
};
