// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useMemo, useState } from 'react';
import LineCharts, { FilterType, xAxisScalesFunc } from '@components/LineCharts';
import { Era, useEra } from '@hooks';
import { Typography } from '@subql/components';
import {
  renderAsync,
  useGetAggregatesEraRewardsByIndexerLazyQuery,
  useGetAggregatesEraRewardsLazyQuery,
} from '@subql/react-hooks';
import { formatSQT, numToHex, parseError, TOKEN, toPercentage } from '@utils';
import { formatNumber } from '@utils/numberFormatters';
import { Skeleton } from 'antd';
import dayjs from 'dayjs';

export const getSplitDataByEra = (currentEra: Era, includeNextEra = false) => {
  const period = currentEra.period;
  const splitData = 86400;

  const plusedEra = period > splitData ? 1 : Math.floor(splitData / period);
  // TODO:
  //   There have some problems in here
  //   1. secondFromLastTimes / period is just a fuzzy result. also we can get the exactly result by Graphql.
  //   2. based on 1. also need to calcuate the xAxisScale in props.
  //   3. based on 1. and 2. also need to do a lots of things for compatite dev env(1 era < 1 day).
  const getIncludesEras = (lastTimes: dayjs.Dayjs) => {
    const today = dayjs();
    const secondsFromLastTimes = (+today - +lastTimes) / 1000;

    const eras = Math.ceil(secondsFromLastTimes / period) + (includeNextEra ? plusedEra : 0);

    const currentEraIndex = includeNextEra ? currentEra.index + plusedEra : currentEra.index;
    const includesEras = new Array(eras)
      .fill(0)
      .map((_, index) => currentEraIndex - index)
      .filter((i) => i > 0);
    return {
      includesErasHex: includesEras.map(numToHex),
      includesEras,
      allErasHex: new Array(currentEraIndex).fill(0).map((_, index) => numToHex(index + 1)),
    };
  };

  const fillData = (
    rawData: readonly {
      readonly keys: readonly string[] | null;
      readonly sum: { readonly amount: string | bigint } | null;
    }[],
    includesErasHex: string[],
    paddingLength: number,

    options?: {
      fillDevDataByGetMax: boolean;
    },
  ) => {
    if (rawData.some((i) => !i.keys || !i.sum)) {
      return [];
    }

    const amounts = rawData.map((i) => {
      return {
        key: (i.keys as string[])[0],
        amount: formatSQT((i.sum as { amount: string | bigint }).amount),
      };
    });

    // fill the data that cannot gatherd by Graphql. e.g: includesEras wants to get the data of 0x0c and 0x0d
    // but Graphql just return the data of 0x0c
    // in this situation, the amount and nextAmount of 0x0d is 0x0c's nextAmount
    includesErasHex
      .sort((a, b) => parseInt(a, 16) - parseInt(b, 16))
      .forEach((key) => {
        if (!amounts.find((i) => i.key === key)) {
          amounts.push({ key: key, amount: 0 });
        }
      });

    // Graphql sort is incorrect, because it is a string.
    let renderAmounts = amounts.sort((a, b) => parseInt(a.key, 16) - parseInt(b.key, 16)).map((i) => i.amount);

    // but in dev env will less than one day.
    if (period < splitData) {
      const eraCountOneDay = splitData / period;
      renderAmounts = renderAmounts.reduce(
        (acc: { result: number[]; curResult: number }, cur, index) => {
          if (options?.fillDevDataByGetMax) {
            acc.curResult = Math.max(cur, acc.curResult);
          } else {
            acc.curResult += cur;
          }
          if ((index + 1) % eraCountOneDay === 0 || index === renderAmounts.length - 1) {
            acc.result.push(acc.curResult);
            acc.curResult = 0;
          }

          return acc;
        },
        { result: [], curResult: 0 },
      ).result;
    }

    if (paddingLength > renderAmounts.length) {
      new Array(paddingLength - renderAmounts.length).fill(0).forEach((_) => renderAmounts.unshift(0));
    }

    return renderAmounts;
  };

  return { getIncludesEras, fillData };
};

export const RewardsLineChart = (props: {
  account?: string;
  title?: string;
  dataDimensionsName?: string[];
  /* must have account if this set be true */
  beDelegator?: boolean;
}) => {
  const {
    title = 'Network Rewards',
    dataDimensionsName = ['Node Operator Rewards', 'Delegation Rewards'],
    beDelegator = false,
  } = props;
  const { currentEra } = useEra();
  const [filter, setFilter] = useState<FilterType>({ date: 'lm' });
  const [renderRewards, setRenderRewards] = useState<number[][]>([[]]);
  const [rawRewardsData, setRawRewardsData] = useState<{ indexer: number[]; delegation: number[]; total: number[] }>({
    indexer: [],
    delegation: [],
    total: [],
  });

  const rewardsLineXScales = useMemo(() => {
    const getXScales = (period: number, filterVal: FilterType) => {
      const getDefaultScales = xAxisScalesFunc(period);

      const result = getDefaultScales[filterVal.date]();
      return result.slice(0, result.length - 1);
    };
    const slicedResult = getXScales(currentEra.data?.period || 0, filter);
    return {
      val: {
        renderData: slicedResult.map((i) => i.format('MMM D')),
        rawData: slicedResult,
      },
      getXScales,
    };
  }, [filter.date, currentEra]);

  const [fetchRewards, rewardsData] = useGetAggregatesEraRewardsLazyQuery();

  const [fetchRewardsByIndexer, indexerRewardsData] = useGetAggregatesEraRewardsByIndexerLazyQuery();

  const fetchRewardsByEra = async (filterVal: FilterType | undefined = filter) => {
    if (!currentEra.data) return;
    if (!filterVal) return;
    const { getIncludesEras, fillData } = getSplitDataByEra(currentEra.data);
    const { includesErasHex } = {
      lm: () => getIncludesEras(dayjs().subtract(31, 'day')),
      l3m: () => getIncludesEras(dayjs().subtract(90, 'day')),
      ly: () => getIncludesEras(dayjs().subtract(365, 'day')),
    }[filterVal.date]();
    const apis = props.account ? fetchRewardsByIndexer : fetchRewards;
    const vars = {
      eraIds: includesErasHex,
      indexerId: props.account || '',
    };
    const res = await apis({
      variables: vars,
      fetchPolicy: 'no-cache',
    });

    const maxPaddingLength = rewardsLineXScales.getXScales(currentEra.data.period, filterVal).length;
    // rewards don't want to show lastest era data
    const removedLastEras = includesErasHex.slice(1, includesErasHex.length);
    const curry = <T extends Parameters<typeof fillData>['0']>(data: T) =>
      fillData(data, removedLastEras, maxPaddingLength);
    const indexerRewards = curry(res?.data?.indexerEraReward?.groupedAggregates || []);

    const delegationRewards = beDelegator
      ? // if beDelegator, will have
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        curry(res?.data?.delegatorEraReward?.groupedAggregates || [])
      : curry(res?.data?.delegationEraReward?.groupedAggregates || []);

    setRawRewardsData({
      indexer: indexerRewards,
      delegation: delegationRewards,
      total: fillData(
        (beDelegator
          ? // if beDelegator, will have
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            res?.data?.delegatorTotalRewards?.groupedAggregates
          : res?.data?.eraRewards?.groupedAggregates) || [],
        removedLastEras,
        maxPaddingLength,
      ),
    });

    setRenderRewards([indexerRewards, delegationRewards]);
  };

  useEffect(() => {
    fetchRewardsByEra();
  }, [currentEra.data?.index, props.account]);

  return renderAsync(props.account ? indexerRewardsData : rewardsData, {
    loading: () => <Skeleton active paragraph={{ rows: 8 }}></Skeleton>,
    error: (e) => <Typography>{parseError(e)}</Typography>,
    data: () => {
      return (
        <LineCharts
          value={filter}
          onChange={(val) => {
            setFilter(val);
            fetchRewardsByEra(val);
          }}
          xAxisScales={rewardsLineXScales.val}
          title={title}
          dataDimensionsName={dataDimensionsName}
          chartData={renderRewards}
          onTriggerTooltip={(index, curDate) => {
            return `<div class="col-flex" style="width: 280px; font-size: 12px;">
              <span>${curDate.format('MMM D, YYYY')}</span>
              <div class="flex-between" style="margin-top: 8px;">
                <span>Total</span>
                <span>${formatNumber(rawRewardsData.total[index])} ${TOKEN}</span>
              </div>
              <div class="flex-between" style="margin: 8px 0;">
                <span>${dataDimensionsName[0]}</span>
                <span>${formatNumber(rawRewardsData.indexer[index])} ${TOKEN} (${toPercentage(
              rawRewardsData.indexer[index],
              rawRewardsData.total[index],
            )})</span>
              </div>
              <div class="flex-between">
              <span>${dataDimensionsName[1]}</span>
              <span>${formatNumber(rawRewardsData.delegation[index])} ${TOKEN} (${toPercentage(
              rawRewardsData.delegation[index],
              rawRewardsData.total[index],
            )})</span>
            </div>
            </div>`;
          }}
        ></LineCharts>
      );
    },
  });
};
