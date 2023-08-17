// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import LineCharts, { FilterType } from '@components/LineCharts';
import { useEra } from '@hooks';
import { formatNumber } from '@polkadot/util';
import { Spinner, Typography } from '@subql/components';
import { renderAsync } from '@subql/react-hooks';
import { parseError, TOKEN, toPercentage } from '@utils';
import dayjs from 'dayjs';

import { getSplitDataByEra } from '../RewardsLineChart/RewardsLineChart';

export const StakeAndDelegationLineChart = () => {
  const { currentEra } = useEra();
  const [filter, setFilter] = useState<FilterType>({ date: 'lm' });

  const [fetchStakeAndDelegation, stakeAndDelegation] = useLazyQuery(gql`
    query MyQuery($eraIds: [String!]) {
      indexerStakeSummaries(filter: { eraId: { in: $eraIds } }) {
        groupedAggregates(groupBy: ERA_ID) {
          sum {
            delegatorStake
            indexerStake
            totalStake
          }
          keys
        }
      }
    }
  `);

  const [renderStakeAndDelegation, setRenderStakeAndDelegation] = useState<number[][]>([[]]);
  const [rawFetchedData, setRawFetchedData] = useState<{ indexer: number[]; delegation: number[]; total: number[] }>({
    indexer: [],
    delegation: [],
    total: [],
  });

  const fetchStakeAndDelegationByEra = async (filterVal: FilterType | undefined = filter) => {
    if (!filterVal) return;
    if (!currentEra.data) return;
    if (!filterVal) return;
    const { getIncludesEras, fillData } = getSplitDataByEra(currentEra.data);

    const { includesErasHex } = {
      lm: () => getIncludesEras(dayjs().subtract(31, 'day')),
      l3m: () => getIncludesEras(dayjs().subtract(90, 'day')),
      ly: () => getIncludesEras(dayjs().subtract(365, 'day')),
    }[filterVal.date]();

    const res = await fetchStakeAndDelegation({
      variables: {
        eraIds: includesErasHex,
      },
      fetchPolicy: 'no-cache',
    });

    const maxPaddingLength = { lm: 31, l3m: 90, ly: 365 }[filterVal.date];
    const curry = <T extends Parameters<typeof fillData>['0']>(data: T) =>
      fillData(data, includesErasHex, maxPaddingLength);

    const indexerStakes = curry(
      res.data.indexerStakeSummaries.groupedAggregates.map((i) => ({ ...i, sum: { amount: i.sum.indexerStake } })),
    );
    const delegationStakes = curry(
      res.data.indexerStakeSummaries.groupedAggregates.map((i) => ({ ...i, sum: { amount: i.sum.delegatorStake } })),
    );
    setRawFetchedData({
      indexer: indexerStakes,
      delegation: delegationStakes,
      total: curry(
        res.data.indexerStakeSummaries.groupedAggregates.map((i) => ({ ...i, sum: { amount: i.sum.totalStake } })),
      ),
    });

    setRenderStakeAndDelegation([indexerStakes, delegationStakes]);
  };

  useEffect(() => {
    fetchStakeAndDelegationByEra();
  }, [currentEra.data?.index]);

  return renderAsync(stakeAndDelegation, {
    loading: () => <Spinner></Spinner>,
    error: (e) => <Typography>{parseError(e)}</Typography>,
    data: () => {
      return (
        <LineCharts
          value={filter}
          onChange={(val) => {
            setFilter(val);
            fetchStakeAndDelegationByEra(val);
          }}
          title="Network Staking and Delegation"
          dataDimensionsName={['Staking', 'Delegation']}
          chartData={renderStakeAndDelegation}
          onTriggerTooltip={(index, curDate) => {
            return `<div class="col-flex" style="width: 280px">
          <span>${curDate.format('MMM D, YYYY')}</span>
          <div class="flex-between" style="margin-top: 8px;">
            <span>Total</span>
            <span>${formatNumber(rawFetchedData.total[index])} ${TOKEN}</span>
          </div>
          <div class="flex-between" style="margin: 8px 0;">
            <span>Staking</span>
            <span>${formatNumber(rawFetchedData.indexer[index])} ${TOKEN} (${toPercentage(
              rawFetchedData.indexer[index],
              rawFetchedData.total[index],
            )})</span>
          </div>
          <div class="flex-between">
          <span>Delegation</span>
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
