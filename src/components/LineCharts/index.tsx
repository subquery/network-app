// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useMemo, useState } from 'react';
import { Spinner, Typography } from '@subql/components';
import formatNumber from '@utils/formatNumber';
import { Radio } from 'antd';
import dayjs from 'dayjs';
import { LineChart } from 'echarts/charts';
import { GridComponent, TitleComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { SVGRenderer } from 'echarts/renderers';
import ReactEChartsCore from 'echarts-for-react/lib/core';

import styles from './index.module.less';

interface IProps {
  data: number[][];
  dataDimensionsName: string[];
  onTriggerTooltip?: (index: number) => string;
  onChangeDateRange?: (dateType: 'lw' | 'lm' | 'ly') => void;
  title?: string;
}

echarts.use([LineChart, GridComponent, TitleComponent, TooltipComponent, SVGRenderer]);
const colors = ['rgba(67, 136, 221, 0.70)', 'rgba(67, 136, 221, 0.30)'];

const LineCharts: FC<IProps> = ({ title, data, dataDimensionsName }) => {
  const [filter, setFilter] = useState({
    date: 'lw',
  });

  const xAxisScales = useMemo(() => {
    const currentDate = dayjs();
    const makeLastWeek = () => {
      return new Array(7)
        .fill(0)
        .map((_, index) => currentDate.subtract(index, 'day').format('MMM D'))
        .reverse();
    };

    const makeLastMonth = () => {
      return new Array(31)
        .fill(0)
        .map((_, index) => currentDate.subtract(index, 'day').format('MMM D'))
        .reverse();
    };

    const makeLastYear = () => {
      return new Array(12)
        .fill(0)
        .map((_, index) => currentDate.subtract(index, 'month').format('MMM'))
        .reverse();
    };

    if (filter.date === 'lw') return makeLastWeek();
    if (filter.date === 'lm') return makeLastMonth();
    if (filter.date === 'ly') return makeLastYear();
  }, [filter.date]);

  const renderedSeries = useMemo(() => {
    return data.map((source, index) => {
      return {
        smooth: true,
        data: source,
        type: 'line',
        showSymbol: false,
        color: colors[index],
        areaStyle: {
          color: colors[index],
        },
      };
    });
  }, [data]);

  return (
    <div className={styles.lineCharts}>
      <div className={styles.headers}>
        {title && (
          <Typography variant="large" weight={600}>
            {title}
          </Typography>
        )}
        <span style={{ flex: 1 }}></span>
        <Radio.Group
          options={[
            { label: 'Last Week', value: 'lw' },
            { label: 'Last Month', value: 'lm' },
            { label: 'Last Year', value: 'ly' },
          ]}
          onChange={(val) => {
            setFilter({
              ...filter,
              date: val.target.value,
            });
          }}
          value={filter.date}
          optionType="button"
          buttonStyle="solid"
        />
      </div>
      <div className="flex">
        {dataDimensionsName.map((name, index) => {
          return (
            <div className="flex" style={{ marginRight: 16 }} key={`${name}-${index}`}>
              <div style={{ height: 10, width: 10, borderRadius: '50%', background: colors[index] }} />
              <Typography style={{ marginLeft: 8, color: 'var(--sq-gray600)' }}>{name}</Typography>
            </div>
          );
        })}
      </div>
      {data.length ? (
        <ReactEChartsCore
          echarts={echarts}
          option={{
            grid: {
              left: 50,
              right: 20,
              top: 50,
            },
            xAxis: {
              axisLabel: {
                align: 'right',
                interval: filter.date === 'lm' ? 2 : 0,
              },
              axisLine: {
                show: false,
              },
              axisTick: {
                show: false,
              },
              type: 'category',
              boundaryGap: false,
              data: xAxisScales,
            },
            yAxis: {
              type: 'value',
              // max: 9999999999,
              axisLabel: {
                formatter: (val: number) => formatNumber(val),
              },
            },
            tooltip: {
              trigger: 'axis',
              borderWidth: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              textStyle: {
                color: '#fff',
              },
              formatter: (params) => {
                // console.warn(params);
                // const [first]
                return '123';
              },
            },
            series: renderedSeries,
          }}
          notMerge={true}
          lazyUpdate={true}
        />
      ) : (
        <Spinner></Spinner>
      )}
    </div>
  );
};
export default LineCharts;
