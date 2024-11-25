// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { CSSProperties, FC, useMemo } from 'react';
import { Spinner, Typography } from '@subql/components';
import { formatNumber } from '@utils/numberFormatters';
import { clsx } from 'clsx';
import { LineChart } from 'echarts/charts';
import {
  GridComponent,
  MarkLineComponent,
  TitleComponent,
  TooltipComponent,
  VisualMapComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { SVGRenderer } from 'echarts/renderers';
import ReactEChartsCore from 'echarts-for-react/lib/core';

import styles from './index.module.less';

interface IProps {
  seriesData: [string, number][];
  markLineData: { xAxis: number | string }[];
  style?: CSSProperties;
  onTriggerTooltip?: (index: number, data: [string, number]) => string;
  title?: string;
  suffix?: string;
  customColors?: string[];
}

echarts.use([
  LineChart,
  GridComponent,
  TitleComponent,
  TooltipComponent,
  SVGRenderer,
  MarkLineComponent,
  VisualMapComponent,
]);
const colors = ['rgba(67, 136, 221, 0.70)', 'rgba(67, 136, 221, 0.30)'];

const LineChartWithMarkLine: FC<IProps> = ({
  title,
  suffix,
  style,
  seriesData,
  markLineData,
  onTriggerTooltip,
  customColors,
}) => {
  const renderedSeries = useMemo(() => {
    return [
      {
        type: 'line',
        smooth: 0.5,
        symbol: 'none',
        lineStyle: {
          color: colors[0],
          width: 3,
        },
        markLine: {
          symbol: ['none', 'none'],
          label: { show: false },
          data: [...markLineData, { xAxis: 0, lineStyle: { color: 'red', width: 2 } }],
        },
        data: seriesData,
        areaStyle: {},
      },
    ];
  }, [seriesData, markLineData, customColors]);
  return (
    <div className={clsx(styles.lineCharts)} style={style}>
      <div className={styles.headers}>
        {title && (
          <Typography variant="large" weight={600}>
            {title}
          </Typography>
        )}
      </div>
      {seriesData.length ? (
        <ReactEChartsCore
          echarts={echarts}
          option={{
            xAxis: {
              type: 'category',
            },
            yAxis: {},
            tooltip: {
              trigger: 'axis',
              borderWidth: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              textStyle: {
                color: '#fff',
              },
              className: 'lineChartToolTip',
              formatter: (params: [{ dataIndex: number; data: [string, number] }]) => {
                const [x] = params;
                try {
                  const renderString = onTriggerTooltip?.(x.dataIndex, x.data);
                  return renderString;
                  return '';
                } catch (e) {
                  return;
                }
              },
            },
            visualMap: {
              type: 'piecewise',
              show: false,
              dimension: 0,
              seriesIndex: 0,
              pieces: [
                {
                  gt: 4,
                  lt: 8,
                  color: '#919eab',
                },
              ],
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
export default LineChartWithMarkLine;
