// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useMemo } from 'react';
import { useEra } from '@hooks';
import { usePropsValue } from '@hooks/usePropsValue';
import { Spinner, Typography } from '@subql/components';
import { formatNumber } from '@utils/numberFormatters';
import { Radio } from 'antd';
import dayjs from 'dayjs';
import { LineChart } from 'echarts/charts';
import { GridComponent, TitleComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { SVGRenderer } from 'echarts/renderers';
import ReactEChartsCore from 'echarts-for-react/lib/core';

import styles from './index.module.less';

export type DateRangeType = 'l3m' | 'lm' | 'ly';
export type FilterType = {
  date: DateRangeType;
};
interface IProps {
  chartData: number[][];
  dataDimensionsName: string[];
  value?: FilterType;
  onChange?: (newFilter: FilterType) => void;
  onTriggerTooltip?: (index: number, date: dayjs.Dayjs) => string;
  onChangeDateRange?: (dateType: DateRangeType) => void;
  title?: string;
}

echarts.use([LineChart, GridComponent, TitleComponent, TooltipComponent, SVGRenderer]);
const colors = ['rgba(67, 136, 221, 0.70)', 'rgba(67, 136, 221, 0.30)'];

const LineCharts: FC<IProps> = ({
  value,
  onChange,
  title,
  chartData,
  dataDimensionsName,
  onChangeDateRange,
  onTriggerTooltip,
}) => {
  const { currentEra } = useEra();

  const [filter, setFilter] = usePropsValue({
    value,
    defaultValue: {
      date: 'lm',
    },
    onChange,
  });

  const xAxisScales = useMemo(() => {
    if (!currentEra.data?.period) return;
    const currentDate = dayjs();
    const intervalPeriod = currentEra.data.period < 86400 ? 86400 : currentEra.data.period;
    const getAxisScales = {
      l3m: () => {
        return new Array(Math.ceil((90 * 86400) / intervalPeriod))
          .fill(0)
          .map((_, index) => currentDate.subtract(index * (intervalPeriod / 86400), 'day'))
          .reverse();
      },
      lm: () => {
        return new Array(Math.ceil((31 * 86400) / intervalPeriod))
          .fill(0)
          .map((_, index) => currentDate.subtract(index * (intervalPeriod / 86400), 'day'))
          .reverse();
      },
      ly: () => {
        return new Array(Math.ceil((365 * 86400) / intervalPeriod))
          .fill(0)
          .map((_, index) => currentDate.subtract(index * (intervalPeriod / 86400), 'day'))
          .reverse();
      },
    };

    const scales = getAxisScales[filter.date]();

    return {
      rawData: scales,
      renderData: scales.map((i) => i.format('MMM D')),
    };
  }, [filter.date, currentEra.data?.period]);

  const renderedSeries = useMemo(() => {
    return chartData.map((source, index) => {
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
  }, [chartData]);

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
            { label: 'Last Month', value: 'lm' },
            { label: 'Last 3 Month', value: 'l3m' },
            { label: 'Last Year', value: 'ly' },
          ]}
          onChange={(val) => {
            setFilter({
              ...filter,
              date: val.target.value,
            });
            onChangeDateRange?.(val.target.value);
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
      {chartData.length ? (
        <ReactEChartsCore
          echarts={echarts}
          option={{
            grid: {
              left: 65,
              right: 20,
              top: 50,
            },
            xAxis: {
              axisLabel: {
                align: 'right',
              },
              axisLine: {
                show: false,
              },
              axisTick: {
                show: false,
              },
              type: 'category',
              boundaryGap: false,
              data: xAxisScales?.renderData,
            },
            yAxis: {
              type: 'value',
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
              className: 'lineChartToolTip',
              formatter: (params: [{ dataIndex: number }]) => {
                const [x] = params;
                try {
                  const renderString = onTriggerTooltip?.(
                    x.dataIndex,
                    xAxisScales?.rawData[x.dataIndex] as dayjs.Dayjs,
                  );
                  return renderString;
                } catch (e) {
                  return;
                }
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
