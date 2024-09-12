// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { CSSProperties, FC, useMemo } from 'react';
import { useEra } from '@hooks';
import { usePropsValue } from '@hooks/usePropsValue';
import { Spinner, Typography } from '@subql/components';
import { formatNumber } from '@utils/numberFormatters';
import { Radio } from 'antd';
import { clsx } from 'clsx';
import dayjs from 'dayjs';
import { BarChart } from 'echarts/charts';
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
  value?: FilterType;
  style?: CSSProperties;
  xAxisScales?: {
    rawData: any[];
    renderData: string[];
  };
  theme?: 'light' | 'dark';
  onChange?: (newFilter: FilterType) => void;
  onTriggerTooltip?: (index: number, data: any) => string;
  title?: string;
  suffix?: string;
  customColors?: string[];
}

echarts.use([BarChart, GridComponent, TitleComponent, TooltipComponent, SVGRenderer]);
const colors = ['rgba(67, 136, 221, 0.70)', 'rgba(67, 136, 221, 0.30)'];

const BarCharts: FC<IProps> = ({
  value,
  onChange,
  xAxisScales = {
    renderData: [],
    rawData: [],
  },
  title,
  suffix,
  style,
  chartData,
  theme = 'light',
  onTriggerTooltip,
  customColors,
}) => {
  const { currentEra } = useEra();
  const [filter, setFilter] = usePropsValue({
    value,
    defaultValue: {
      date: 'lm',
    },
    onChange,
  });

  const renderedSeries = useMemo(() => {
    return chartData.map((source, index) => {
      return {
        smooth: true,
        data: source,
        type: 'bar',
        color: (customColors || colors)[index],
        barWidth: 24,
        areaStyle: {
          color: (customColors || colors)[index],
        },
      };
    });
  }, [chartData, customColors]);

  return (
    <div className={clsx(styles.lineCharts, theme === 'dark' ? styles.dark : '')} style={style}>
      <div className={styles.headers}>
        {title && (
          <Typography variant="large" weight={600}>
            {title}
          </Typography>
        )}
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
                align: 'centrer',
                width: 20,
                margin: 10,
              },
              axisLine: {
                show: false,
              },
              axisTick: {
                show: false,
              },
              type: 'category',
              data: xAxisScales.renderData,
            },
            yAxis: {
              type: 'value',
              axisLabel: {
                formatter: (val: number) => formatNumber(val),
              },
              splitLine: {
                lineStyle: theme === 'light' ? { color: '#fff' } : { color: 'var(--dark-mode-border)' },
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
                  const renderString = onTriggerTooltip?.(x.dataIndex, xAxisScales?.rawData[x.dataIndex]);
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
      {suffix && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Typography type="secondary" style={{ color: 'var(--sq-gray500)' }} variant="small">
            {suffix}
          </Typography>
        </div>
      )}
    </div>
  );
};
export default BarCharts;
