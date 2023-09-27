// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useMemo, useState } from 'react';
import { STABLE_TOKEN, STABLE_TOKEN_ADDRESS, STABLE_TOKEN_DECIMAL, TOKEN } from '@utils';
import { useInterval } from 'ahooks';
import BigNumber from 'bignumber.js';
import dayjs from 'dayjs';
import { formatUnits } from 'ethers/lib/utils';

import { useWeb3Store } from 'src/stores';

export const useStableCoin = () => {
  const { contracts } = useWeb3Store();
  const [rates, setRates] = useState({
    usdcToSqt: 0,
    sqtToUsdc: 0,
  });
  const [now, setNow] = useState<dayjs.Dayjs>();
  const coinsAddressDict = useMemo<{ [key: string]: 'USDC' | 'kSQT' | 'SQT' }>(() => {
    if (!contracts?.sqToken)
      return {
        [STABLE_TOKEN_ADDRESS]: STABLE_TOKEN,
      };
    return {
      [STABLE_TOKEN_ADDRESS]: STABLE_TOKEN,
      [contracts.sqToken.address]: TOKEN,
    };
  }, [contracts]);

  const getPriceOracle = async () => {
    if (!contracts) return;
    const assetPrice = await contracts.priceOracle.getAssetPrice(STABLE_TOKEN_ADDRESS, contracts.sqToken.address);

    const oneUsdcToOneSqt = +formatUnits(assetPrice.toString(), STABLE_TOKEN_DECIMAL);
    setRates({
      usdcToSqt: BigNumber(oneUsdcToOneSqt).decimalPlaces(2).toNumber(),
      sqtToUsdc: BigNumber(1 / oneUsdcToOneSqt)
        .decimalPlaces(2)
        .toNumber(),
    });
  };

  const transPrice = (fromAddress: string | undefined, price: string | number | bigint) => {
    const resultCalc = BigNumber(price.toString()).multipliedBy(
      fromAddress === contracts?.sqToken.address ? rates.sqtToUsdc : rates.usdcToSqt,
    );
    return {
      usdcPrice: (fromAddress === contracts?.sqToken.address ? resultCalc.toFixed() : price).toString(),
      sqtPrice: (fromAddress === contracts?.sqToken.address ? price : resultCalc.toFixed()).toString(),
    };
  };

  const pricePreview = (fromAddress: string | undefined, price: string | number | bigint) => {
    const sqtTokenAddress = contracts?.sqToken.address;
    const resultCalc = BigNumber(price.toString()).multipliedBy(
      fromAddress === sqtTokenAddress ? rates.sqtToUsdc : rates.usdcToSqt,
    );

    if (!price) {
      return `1 ${fromAddress === sqtTokenAddress ? TOKEN : STABLE_TOKEN} = ${
        fromAddress === sqtTokenAddress ? rates.sqtToUsdc : rates.usdcToSqt
      } ${fromAddress === sqtTokenAddress ? STABLE_TOKEN : TOKEN} | ${(now || dayjs()).format('HH:mm:ss A')}`;
    }

    return `${price} ${fromAddress === sqtTokenAddress ? TOKEN : STABLE_TOKEN} = ${resultCalc.toFixed()} ${
      fromAddress === sqtTokenAddress ? STABLE_TOKEN : TOKEN
    } | ${(now || dayjs()).format('HH:mm:ss A')}`;
  };

  useInterval(
    async () => {
      await getPriceOracle();
      setNow(dayjs());
    },
    30000,
    {
      immediate: true,
    },
  );

  return {
    coinsAddressDict,
    rates,
    fetchedTime: now,
    pricePreview,
    transPrice,
  };
};
