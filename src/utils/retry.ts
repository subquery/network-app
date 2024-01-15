// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

export const retry = (func: any, sleepTime = 3000) => {
  let times = 0;

  const clear = setInterval(() => {
    func();
    times += 1;
    if (times === 5) {
      clearInterval(clear);
    }
  }, sleepTime);
};
