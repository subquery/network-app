// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useMemo, useState } from 'react';
import { formatEther, formatSQT, STABLE_TOKEN, STABLE_TOKEN_ADDRESS, STABLE_TOKEN_DECIMAL, TOKEN } from '@utils';
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

    // const oneUsdcToOneSqt = +formatUnits(assetPrice.toString(), STABLE_TOKEN_DECIMAL);
    const oneUsdcToOneSqt = +formatEther(assetPrice.toString());

    setRates({
      usdcToSqt: BigNumber(oneUsdcToOneSqt).decimalPlaces(2).toNumber(),
      sqtToUsdc: BigNumber(1 / oneUsdcToOneSqt)
        .decimalPlaces(2)
        .toNumber(),
    });
  };

  const transPrice = (fromAddress: string | undefined, price: string | number | bigint) => {
    const sortedPrice =
      fromAddress === contracts?.sqToken.address
        ? formatSQT(price.toString())
        : formatUnits(price, STABLE_TOKEN_DECIMAL);

    const resultCalc = BigNumber(sortedPrice).multipliedBy(
      fromAddress === contracts?.sqToken.address ? rates.sqtToUsdc : rates.usdcToSqt,
    );
    return {
      usdcPrice: (fromAddress === contracts?.sqToken.address ? resultCalc.toFixed() : sortedPrice).toString(),
      sqtPrice: (fromAddress === contracts?.sqToken.address ? sortedPrice : resultCalc.toFixed()).toString(),
    };
  };

  const pricePreview = (fromAddress: string | undefined, price: string | number | bigint) => {
    const sqtTokenAddress = contracts?.sqToken.address;
    if (!price) {
      return `1 ${fromAddress === sqtTokenAddress ? TOKEN : STABLE_TOKEN} = ${
        fromAddress === sqtTokenAddress ? rates.sqtToUsdc : rates.usdcToSqt
      } ${fromAddress === sqtTokenAddress ? STABLE_TOKEN : TOKEN} | ${(now || dayjs()).format('HH:mm:ss A')}`;
    }
    const resultCalc = BigNumber(price.toString()).multipliedBy(
      fromAddress === sqtTokenAddress ? rates.sqtToUsdc : rates.usdcToSqt,
    );

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
