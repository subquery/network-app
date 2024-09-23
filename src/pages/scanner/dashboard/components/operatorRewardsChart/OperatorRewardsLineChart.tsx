import { CSSProperties, useEffect, useMemo, useState } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import LineCharts, { FilterType, xAxisScalesFunc } from '@components/LineCharts';
import { useEra } from '@hooks';
import { getSplitDataByEra } from '@pages/dashboard/components/RewardsLineChart/RewardsLineChart';
import { Typography } from '@subql/components';
import { formatNumber, numToHex, parseError, renderAsync, TOKEN, toPercentage } from '@utils';
import { Skeleton } from 'antd';
import BigNumberJs from 'bignumber.js';
import dayjs from 'dayjs';

export const OperatorRewardsLineChart = (props: {
  account?: string;
  title?: string;
  dataDimensionsName?: string[];
  chartsStyle?: CSSProperties;
  skeletonHeight?: number;
}) => {
  const {
    title = 'Node Operator Rewards',
    dataDimensionsName = ['Stake Rewards', 'Query Rewards'],
    chartsStyle,
    skeletonHeight,
  } = props;
  const { currentEra } = useEra();
  const [filter, setFilter] = useState<FilterType>({ date: 'lm' });
  const [renderRewards, setRenderRewards] = useState<number[][]>([[]]);
  const [rawRewardsData, setRawRewardsData] = useState<{ allocation: number[]; query: number[]; total: number[] }>({
    allocation: [],
    query: [],
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

  const [fetchRewards, rewardsData] = useLazyQuery<{
    eraDeploymentRewards: {
      groupedAggregates: { keys: string[]; sum: { allocationRewards: string; totalRewards: string } }[];
    };
  }>(gql`
    query fetchRewards($eraIds: [Int!]!) {
      eraDeploymentRewards(filter: { eraIdx: { in: $eraIds } }) {
        groupedAggregates(groupBy: ERA_IDX) {
          keys
          sum {
            allocationRewards
            totalRewards
          }
        }
      }
    }
  `);

  const fetchRewardsByEra = async (filterVal: FilterType | undefined = filter) => {
    if (!currentEra.data) return;
    if (!filterVal) return;
    const { getIncludesEras, fillData } = getSplitDataByEra(currentEra.data);
    const { includesEras, includesErasHex } = {
      lm: () => getIncludesEras(dayjs().subtract(31, 'day')),
      l3m: () => getIncludesEras(dayjs().subtract(90, 'day')),
      ly: () => getIncludesEras(dayjs().subtract(365, 'day')),
    }[filterVal.date]();
    const apis = fetchRewards;
    const vars = {
      eraIds: includesEras,
      indexerId: props.account || '',
    };
    const res = await apis({
      variables: vars,
      fetchPolicy: 'no-cache',
    });

    const maxPaddingLength = rewardsLineXScales.getXScales(currentEra.data.period, filterVal).length;

    // // rewards don't want to show lastest era data
    const removedLastEras = includesErasHex.slice(1, includesErasHex.length);
    const curry = <T extends Parameters<typeof fillData>['0']>(data: T) =>
      fillData(data, removedLastEras, maxPaddingLength);
    const allocationRewards = curry(
      res?.data?.eraDeploymentRewards?.groupedAggregates?.map((i) => {
        return {
          keys: i.keys.map((i) => numToHex(+i)),

          sum: {
            amount: i.sum.allocationRewards,
          },
        };
      }) || [],
    );

    const queryRewards = curry(
      res?.data?.eraDeploymentRewards?.groupedAggregates?.map((i) => {
        return {
          keys: i.keys.map((i) => numToHex(+i)),

          sum: {
            amount: BigNumberJs(i.sum.totalRewards).minus(i.sum.allocationRewards).toString(),
          },
        };
      }) || [],
    );

    const totalRewards = curry(
      res?.data?.eraDeploymentRewards?.groupedAggregates?.map((i) => {
        return {
          keys: i.keys.map((i) => numToHex(+i)),
          sum: {
            amount: i.sum.totalRewards,
          },
        };
      }) || [],
    );
    setRawRewardsData({
      allocation: allocationRewards,
      query: queryRewards,
      total: totalRewards,
    });

    setRenderRewards([allocationRewards, queryRewards]);
  };

  useEffect(() => {
    fetchRewardsByEra();
  }, [currentEra.data?.index, props.account]);

  return renderAsync(
    {
      ...rewardsData,
      loading: rewardsData.previousData ? false : rewardsData.loading,
      data: rewardsData.data || rewardsData.previousData,
    },
    {
      loading: () => (
        <Skeleton
          className="darkSkeleton"
          active
          paragraph={{ rows: 8 }}
          style={{ height: skeletonHeight ? skeletonHeight : 'auto' }}
        ></Skeleton>
      ),
      error: (e) => <Typography>{parseError(e)}</Typography>,
      data: () => {
        return (
          <LineCharts
            theme="dark"
            value={filter}
            onChange={(val) => {
              setFilter(val);
              fetchRewardsByEra(val);
            }}
            style={chartsStyle}
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
                <span>${formatNumber(rawRewardsData.allocation[index])} ${TOKEN} (${toPercentage(
                  rawRewardsData.allocation[index],
                  rawRewardsData.total[index],
                )})</span>
              </div>
              <div class="flex-between">
              <span>${dataDimensionsName[1]}</span>
              <span>${formatNumber(rawRewardsData.query[index])} ${TOKEN} (${toPercentage(
                rawRewardsData.query[index],
                rawRewardsData.total[index],
              )})</span>
            </div>
            </div>`;
            }}
          ></LineCharts>
        );
      },
    },
  );
};
