// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';
import BigNumberJs from 'bignumber.js';

export const useSqtPrice = () => {
  const [sqtPrice, setSqtPrice] = useState('0');

  useEffect(() => {
    const fetchSqtPrice = async () => {
      try {
        const response = await fetch('https://sqt.subquery.foundation/price');
        const data = await response.text();
        setSqtPrice(BigNumberJs(data).toString());
      } catch (error) {
        // don't care of this
      }
    };
    fetchSqtPrice();
  }, []);

  return sqtPrice;
};
