// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState, useRef, RefObject } from 'react';
import { useWeb3 } from '../containers';
import { convertStringToNumber, formatEther } from '../utils';

interface UseBalanceReturn {
  account: string | null | undefined;
  balance: number;
}

export function useBalance(): UseBalanceReturn {
  const [balance, setBalance] = useState<number>(0);
  const { account, library } = useWeb3();

  useEffect(() => {
    const getAccountBalance = async () => {
      if (account) {
        const balance = await library?.getBalance(account);
        const formattedBalance = formatEther(balance);
        const convertedBalance = convertStringToNumber(formattedBalance);
        setBalance(convertedBalance);
      }
    };
    getAccountBalance();
  }, [account, library]);

  return { account, balance };
}
