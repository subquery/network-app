// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import { waitForSomething } from '@utils/waitForSomething';
import { isNumber } from 'lodash-es';

export const useWaitTransactionhandled = () => {
  const [requestLastProcessedHeight] = useLazyQuery(gql`
    query {
      _metadata {
        lastProcessedHeight
      }
    }
  `);

  const waitTransactionHandled = useCallback(async (targetHeight = 0) => {
    if (!isNumber(targetHeight)) return true;

    const res = await waitForSomething({
      func: async () => {
        const { data } = await requestLastProcessedHeight({
          fetchPolicy: 'network-only',
        });
        return data?._metadata?.lastProcessedHeight >= targetHeight;
      },
      splitTime: 2000,
      timeout: 30_000,
    });

    return res;
  }, []);

  return waitTransactionHandled;
};
