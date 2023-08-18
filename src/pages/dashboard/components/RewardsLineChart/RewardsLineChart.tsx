// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import LineCharts, { FilterType } from '@components/LineCharts';
import { Era, useEra } from '@hooks';
import { Typography } from '@subql/components';
import { renderAsync } from '@subql/react-hooks';
import { formatSQT, parseError, TOKEN, toPercentage, transNumToHex } from '@utils';
import formatNumber from '@utils/numberFormatters';
import { Skeleton } from 'antd';
import dayjs from 'dayjs';

export const getSplitDataByEra = (currentEra: Era) => {
  const period = currentEra.period;
  const splitData = 86400;

  // TODO:
  //   There have some problems in here
  //   1. secondFromLastTimes / period is just a fuzzy result. also we can get the exactly result by Graphql.
  //   2. based on 1. also need to calcuate the xAxisScale in props.
  //   3. based on 1. and 2. also need to do a lots of things for compatite dev env(1 era < 1 day).
  const getIncludesEras = (lastTimes: dayjs.Dayjs) => {
    const today = dayjs();
    const secondFromLastTimes = (+today - +lastTimes) / 1000;

    const eras = Math.ceil(secondFromLastTimes / period);
    const currentEraIndex = currentEra.index || 0;
    const includesEras = new Array(eras)
      .fill(0)
      .map((_, index) => currentEraIndex - index)
      .filter((i) => i > 0);
    return {
      includesErasHex: includesEras.map(transNumToHex),
      includesEras,
    };
  };

  const fillData = (
    rawData: { keys: string[]; sum: { amount: string } }[],
    includesErasHex: string[],
    paddingLength: number,
  ) => {
    const amounts = rawData.map((i) => {
      return {
        key: i.keys[0],
        amount: formatSQT(i.sum.amount),
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

    // default eras will greater than one day
    if (period > splitData) {
      const filledPaddingLength = Math.ceil(Math.ceil((paddingLength * splitData) / period));
      if (filledPaddingLength > renderAmounts.length) {
        new Array(filledPaddingLength - renderAmounts.length).fill(0).forEach((_) => renderAmounts.unshift(0));
      }
    }

    // but in dev env will less than one day.
    if (period < splitData) {
      const eraCountOneDay = splitData / period;
      const filledPaddingLength = eraCountOneDay * paddingLength;

      if (filledPaddingLength > renderAmounts.length) {
        new Array(filledPaddingLength - renderAmounts.length).fill(0).forEach((_) => renderAmounts.unshift(0));
      }

      renderAmounts = renderAmounts.reduce(
        (acc: { result: number[]; curResult: number }, cur, index) => {
          acc.curResult += cur;
          if ((index + 1) % eraCountOneDay === 0 || index === renderAmounts.length - 1) {
            acc.result.push(acc.curResult);
            acc.curResult = 0;
          }

          return acc;
        },
        { result: [], curResult: 0 },
      ).result;
    }

    return renderAmounts;
  };

  return { getIncludesEras, fillData };
};

export const RewardsLineChart = (props: { account?: string; title?: string; dataDimensionsName?: string[] }) => {
  const { title = 'Network Rewards', dataDimensionsName = ['Indexer Rewards', 'Delegation Rewards'] } = props;
  const { currentEra } = useEra();
  const [filter, setFilter] = useState<FilterType>({ date: 'lm' });
  const [renderRewards, setRenderRewards] = useState<number[][]>([[]]);
  const [rawRewardsData, setRawRewardsData] = useState<{ indexer: number[]; delegation: number[]; total: number[] }>({
    indexer: [],
    delegation: [],
    total: [],
  });

  const [fetchRewards, rewardsData] = useLazyQuery(gql`
    query MyQuery($eraIds: [String!]) {
      eraRewards(filter: { eraId: { in: $eraIds } }) {
        groupedAggregates(groupBy: ERA_ID) {
          sum {
            amount
          }
          keys
        }
      }

      indexerEraReward: eraRewards(filter: { eraId: { in: $eraIds }, isIndexer: { equalTo: true } }) {
        groupedAggregates(groupBy: ERA_ID) {
          sum {
            amount
          }
          keys
        }
      }

      delegationEraReward: eraRewards(filter: { eraId: { in: $eraIds }, isIndexer: { equalTo: false } }) {
        groupedAggregates(groupBy: ERA_ID) {
          sum {
            amount
          }
          keys
        }
      }
    }
  `);

  const [fetchRewardsByIndexer, indexerRewardsData] = useLazyQuery(gql`
    query MyQuery($indexerId: String!, $eraIds: [String!]) {
      eraRewards(filter: { eraId: { in: $eraIds }, indexerId: { equalTo: $indexerId } }) {
        groupedAggregates(groupBy: ERA_ID) {
          sum {
            amount
          }
          keys
        }
      }

      indexerEraReward: eraRewards(
        filter: { eraId: { in: $eraIds }, isIndexer: { equalTo: true }, indexerId: { equalTo: $indexerId } }
      ) {
        groupedAggregates(groupBy: ERA_ID) {
          sum {
            amount
          }
          keys
        }
      }

      delegationEraReward: eraRewards(
        filter: { eraId: { in: $eraIds }, isIndexer: { equalTo: false }, indexerId: { equalTo: $indexerId } }
      ) {
        groupedAggregates(groupBy: ERA_ID) {
          sum {
            amount
          }
          keys
        }
      }
    }
  `);

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
      indexerId: props.account,
    };
    const res = await apis({
      variables: vars,
      fetchPolicy: 'no-cache',
    });

    const maxPaddingLength = { lm: 31, l3m: 90, ly: 365 }[filterVal.date];

    const curry = <T extends Parameters<typeof fillData>['0']>(data: T) =>
      fillData(data, includesErasHex, maxPaddingLength);
    const indexerRewards = curry(res.data.indexerEraReward.groupedAggregates);
    const delegationRewards = curry(res.data.delegationEraReward.groupedAggregates);
    setRawRewardsData({
      indexer: indexerRewards,
      delegation: delegationRewards,
      total: fillData(res.data.eraRewards.groupedAggregates, includesErasHex, maxPaddingLength),
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
          title={title}
          dataDimensionsName={dataDimensionsName}
          chartData={renderRewards}
          onTriggerTooltip={(index, curDate) => {
            return `<div class="col-flex" style="width: 280px">
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
