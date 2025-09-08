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
  emptyDesc?: string;
}

const EmptyState: FC<{ message?: string }> = ({ message = 'No data available' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
      <rect x="8" y="16" width="48" height="32" rx="2" stroke="var(--sq-gray300)" strokeWidth="2" fill="none" />
      <path
        d="M16 40L24 32L32 36L48 24"
        stroke="var(--sq-gray300)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="20" cy="28" r="2" fill="var(--sq-gray300)" />
      <circle cx="44" cy="20" r="2" fill="var(--sq-gray300)" />
    </svg>
    <Typography variant="medium" type="secondary" style={{ color: 'var(--sq-gray400)', marginTop: 12 }}>
      {message}
    </Typography>
  </div>
);

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
  emptyDesc,
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
        data: seriesData,
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
            series: renderedSeries,
          }}
          notMerge={true}
          lazyUpdate={true}
        />
      ) : (
        <div className="flex" style={{ justifyContent: 'center', height: '100%' }}>
          <EmptyState message={emptyDesc || 'No chart data to display'} />
        </div>
      )}
      {seriesData.length && suffix ? (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Typography type="secondary" style={{ color: 'var(--sq-gray500)' }} variant="small">
            {suffix}
          </Typography>
        </div>
      ) : (
        ''
      )}
    </div>
  );
};
export default LineChartWithMarkLine;
