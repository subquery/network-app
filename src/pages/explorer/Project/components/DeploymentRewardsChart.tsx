// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { CSSProperties, useEffect, useMemo, useState } from 'react';
import LineCharts, { FilterType, xAxisScalesFunc } from '@components/LineCharts';
import { Era, useEra } from '@hooks';
import { getSplitDataByEra } from '@pages/dashboard/components/RewardsLineChart/RewardsLineChart';
import { Typography } from '@subql/components';
import { renderAsync, useGetEraDeploymentRewardsLazyQuery } from '@subql/react-hooks';
import { formatSQT, numToHex, parseError, TOKEN, toPercentage } from '@utils';
import { formatNumber } from '@utils/numberFormatters';
import { sleep } from '@utils/waitForSomething';
import { Skeleton } from 'antd';
import dayjs from 'dayjs';

export const DeploymentRewardsLine = (props: {
  chartsStyle?: CSSProperties;
  skeletonHeight?: number;
  deploymentId?: string;
  allocation?: boolean;
}) => {
  const { chartsStyle, skeletonHeight, deploymentId, allocation } = props;
  const { currentEra } = useEra();
  const [filter, setFilter] = useState<FilterType>({ date: 'lm' });
  const [renderRewards, setRenderRewards] = useState<number[][]>([[]]);
  const [rawRewardsData, setRawRewardsData] = useState<{ total: number[]; allocationRewrads: number[] }>({
    total: [],
    allocationRewrads: [],
  });

  const [fetchEraDeploymentRewards, eraDeploymentRewards] = useGetEraDeploymentRewardsLazyQuery();

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

  const fetchRewardsByEra = async (filterVal: FilterType | undefined = filter) => {
    if (!currentEra.data) return;
    if (!filterVal) return;
    const { getIncludesEras, fillData } = getSplitDataByEra(currentEra.data);
    const { includesEras, includesErasHex } = {
      lm: () => getIncludesEras(dayjs().subtract(31, 'day')),
      l3m: () => getIncludesEras(dayjs().subtract(90, 'day')),
      ly: () => getIncludesEras(dayjs().subtract(365, 'day')),
    }[filterVal.date]();

    const res = await fetchEraDeploymentRewards({
      variables: {
        deploymentId: deploymentId || '',
        eraIds: includesEras,
      },
      fetchPolicy: 'network-only',
    });

    if (res.data) {
      const maxPaddingLength = rewardsLineXScales.getXScales(currentEra.data.period, filterVal).length;
      // rewards don't want to show lastest era data
      const removedLastEras = includesErasHex.slice(1, includesErasHex.length);
      const total = fillData(
        res.data.eraDeploymentRewards?.nodes?.map((item) => {
          return {
            keys: item?.eraIdx ? [`0x${Number(item.eraIdx).toString(16).padStart(2, '0')}`] : null,
            sum: { amount: item?.totalRewards || '0' },
          };
        }) || [],
        removedLastEras,
        maxPaddingLength,
      );

      const allocationRewrads = fillData(
        res.data.eraDeploymentRewards?.nodes?.map((item) => {
          return {
            keys: item?.eraIdx ? [`0x${Number(item.eraIdx).toString(16).padStart(2, '0')}`] : null,
            sum: { amount: item?.allocationRewards || '0' },
          };
        }) || [],
        removedLastEras,
        maxPaddingLength,
      );

      setRawRewardsData({ total, allocationRewrads });
      setRenderRewards([allocation ? allocationRewrads : total]);
    }
  };

  useEffect(() => {
    fetchRewardsByEra();
  }, [currentEra.data?.index, deploymentId]);

  return renderAsync(
    {
      ...eraDeploymentRewards,
      data: eraDeploymentRewards.data || eraDeploymentRewards.previousData,
      loading: eraDeploymentRewards.previousData ? false : eraDeploymentRewards.loading,
    },
    {
      loading: () => (
        <Skeleton
          active
          paragraph={{ rows: 8 }}
          style={{ height: skeletonHeight ? skeletonHeight : 'auto' }}
        ></Skeleton>
      ),
      error: (e) => <Typography>{parseError(e)}</Typography>,
      data: () => {
        return (
          <LineCharts
            value={filter}
            onChange={(val) => {
              setFilter(val);
              fetchRewardsByEra(val);
            }}
            style={{
              border: 'none',
              borderTop: '1px solid var(--sq-gray300)',
              borderRadius: 0,
              ...chartsStyle,
            }}
            xAxisScales={rewardsLineXScales.val}
            chartData={renderRewards}
            onTriggerTooltip={(index, curDate) => {
              return `
              <div class="col-flex" style="width: 280px; font-size: 12px;">
                <span>${curDate.format('MMM D, YYYY')}</span>
                <div class="flex-between" style="margin-top: 8px;">
                  <span>${allocation ? 'Total Boost Rewards' : 'Total rewards'}</span>
                  <span>${formatNumber(allocation ? rawRewardsData.allocationRewrads[index] : rawRewardsData.total[index])} ${TOKEN}</span>
                </div>
              </div>`;
            }}
          ></LineCharts>
        );
      },
    },
  );
};
