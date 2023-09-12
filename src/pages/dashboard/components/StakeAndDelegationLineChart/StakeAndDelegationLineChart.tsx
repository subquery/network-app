// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useMemo, useState } from 'react';
import LineCharts, { FilterType, xAxisScalesFunc } from '@components/LineCharts';
import { useEra } from '@hooks';
import { captureMessage } from '@sentry/react';
import { Typography } from '@subql/components';
import {
  renderAsync,
  useGetIndexerStakesByErasLazyQuery,
  useGetIndexerStakesByIndexerLazyQuery,
} from '@subql/react-hooks';
import { DeepCloneAndChangeReadonlyToMutable, parseError, TOKEN, toPercentage } from '@utils';
import { formatNumber } from '@utils/numberFormatters';
import { Skeleton } from 'antd';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';

import { getSplitDataByEra } from '../RewardsLineChart/RewardsLineChart';

export const StakeAndDelegationLineChart = (props: {
  account?: string;
  title?: string;
  dataDimensionsName?: string[];
}) => {
  const { title = 'Network Staking and Delegation', dataDimensionsName = ['Staking', 'Delegation'] } = props;

  const { currentEra } = useEra();
  const [filter, setFilter] = useState<FilterType>({ date: 'lm' });

  const [fetchStakeAndDelegation, stakeAndDelegation] = useGetIndexerStakesByErasLazyQuery();

  const [fetchStakeAndDelegationByIndexer, stakeAndDelegationByIndexer] = useGetIndexerStakesByIndexerLazyQuery();

  const [renderStakeAndDelegation, setRenderStakeAndDelegation] = useState<number[][]>([[]]);
  const [rawFetchedData, setRawFetchedData] = useState<{ indexer: number[]; delegation: number[]; total: number[] }>({
    indexer: [],
    delegation: [],
    total: [],
  });

  const stakeLineXScales = useMemo(() => {
    const getLatestXScales = (period: number, filterVal: FilterType) => {
      const defaultXScalesFunc = xAxisScalesFunc(period)[filterVal.date];
      const futureEraEndTime = (period || 0) < 86400 ? dayjs().add(1, 'day') : dayjs().add(period || 0, 'seconds');
      return [...defaultXScalesFunc(), futureEraEndTime];
    };

    const xScalesVal = getLatestXScales(currentEra.data?.period || 0, filter);
    return {
      val: {
        renderData: xScalesVal.map((i) => i.format('MMM D')),
        rawData: xScalesVal,
      },
      getLatestXScales,
    };
  }, [currentEra, filter.date]);

  const fetchStakeAndDelegationByEra = async (filterVal: FilterType = filter) => {
    if (!currentEra.data) return;
    if (!filterVal) return;
    const { getIncludesEras, fillData } = getSplitDataByEra(currentEra.data, true);

    const { includesErasHex, allErasHex } = {
      lm: () => getIncludesEras(dayjs().subtract(31, 'day')),
      l3m: () => getIncludesEras(dayjs().subtract(90, 'day')),
      ly: () => getIncludesEras(dayjs().subtract(365, 'day')),
    }[filterVal.date]();

    const apis = props.account ? fetchStakeAndDelegationByIndexer : fetchStakeAndDelegation;

    const res = await apis({
      variables: {
        indexerId: props.account || '',
        eraIds: allErasHex,
      },
      fetchPolicy: 'no-cache',
    });

    if (!res?.data?.indexerStakes?.groupedAggregates) return;

    const padLostEraData = (
      groupedData: {
        keys: string[] | null;
        sum: { delegatorStake: string | bigint; indexerStake: string | bigint; totalStake: string | bigint } | null;
        fixme?: true;
      }[],
    ) => {
      const copyed = cloneDeep(groupedData);

      if (copyed.some((i) => !i.keys || !i.sum)) {
        return [];
      }

      let currentSums: {
        delegatorStake: string | bigint;
        indexerStake: string | bigint;
        totalStake: string | bigint;
      } = {
        delegatorStake: '0',
        indexerStake: '0',
        totalStake: '0',
      };

      includesErasHex.forEach((item) => {
        if (!copyed.find((i) => i?.keys?.[0] === item)) {
          copyed.push({
            keys: [item],
            sum: { ...currentSums },
            fixme: true,
          });
        }
      });

      return copyed
        .sort((a, b) => parseInt(a?.keys?.[0] || '0x00', 16) - parseInt(b?.keys?.[0] || '0x00', 16))
        .map((item) => {
          if (!item.fixme) {
            if (!item.sum) {
              captureMessage('fetched stake and delegation data error, please confirm.');
              return item;
            }
            currentSums = { ...item.sum };
          }
          if (item.fixme) {
            item.sum = { ...currentSums };
          }

          return item;
        })
        .slice(copyed.length - includesErasHex.length, copyed.length);
    };

    const paddedData = padLostEraData(
      DeepCloneAndChangeReadonlyToMutable(res?.data?.indexerStakes?.groupedAggregates) || [],
    );
    // const maxPaddingLength = { lm: 31, l3m: 90, ly: 365 }[filterVal.date];
    const curry = <T extends Parameters<typeof fillData>['0']>(data: T) =>
      fillData(
        data,
        includesErasHex,
        stakeLineXScales.getLatestXScales(currentEra.data?.period || 0, filterVal).length,
        {
          fillDevDataByGetMax: true,
        },
      );

    const indexerStakes = curry(paddedData.map((i) => ({ ...i, sum: { amount: i?.sum?.indexerStake || '0' } })));
    const delegationStakes = curry(paddedData.map((i) => ({ ...i, sum: { amount: i?.sum?.delegatorStake || '0' } })));
    setRawFetchedData({
      indexer: indexerStakes,
      delegation: delegationStakes,
      total: curry(paddedData.map((i) => ({ ...i, sum: { amount: i?.sum?.totalStake || '0' } }))),
    });

    setRenderStakeAndDelegation([indexerStakes, delegationStakes]);
  };

  useEffect(() => {
    fetchStakeAndDelegationByEra();
  }, [currentEra.data?.index, props.account]);

  return renderAsync(props.account ? stakeAndDelegationByIndexer : stakeAndDelegation, {
    loading: () => <Skeleton active paragraph={{ rows: 8 }}></Skeleton>,
    error: (e) => <Typography>{parseError(e)}</Typography>,
    data: () => {
      return (
        <LineCharts
          value={filter}
          onChange={(val) => {
            setFilter(val);
            fetchStakeAndDelegationByEra(val);
          }}
          xAxisScales={stakeLineXScales.val}
          title={title}
          dataDimensionsName={dataDimensionsName}
          chartData={renderStakeAndDelegation}
          onTriggerTooltip={(index, curDate) => {
            return `<div class="col-flex" style="width: 280px">
          <span>${curDate.format('MMM D, YYYY')}</span>
          <div class="flex-between" style="margin-top: 8px;">
            <span>Total</span>
            <span>${formatNumber(rawFetchedData.total[index])} ${TOKEN}</span>
          </div>
          <div class="flex-between" style="margin: 8px 0;">
            <span>${dataDimensionsName[0]}</span>
            <span>${formatNumber(rawFetchedData.indexer[index])} ${TOKEN} (${toPercentage(
              rawFetchedData.indexer[index],
              rawFetchedData.total[index],
            )})</span>
          </div>
          <div class="flex-between">
          <span>${dataDimensionsName[1]}</span>
          <span>${formatNumber(rawFetchedData.delegation[index])} ${TOKEN} (${toPercentage(
              rawFetchedData.delegation[index],
              rawFetchedData.total[index],
            )})</span>
        </div>
        </div>`;
          }}
        ></LineCharts>
      );
    },
  });
};
