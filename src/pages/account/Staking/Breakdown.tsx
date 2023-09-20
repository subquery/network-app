// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from 'react';
import { PieChart } from 'echarts/charts';
import { LegendComponent, TitleComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { LabelLayout } from 'echarts/features';
import { SVGRenderer } from 'echarts/renderers';
import ReactEChartsCore from 'echarts-for-react/lib/core';

echarts.use([TitleComponent, TooltipComponent, LegendComponent, PieChart, SVGRenderer, LabelLayout]);

interface IProps {
  data: {
    value: number;
  }[];
}

const Breakdown: FC<IProps> = (props) => {
  return (
    <div>
      <ReactEChartsCore
        style={{ height: 336, width: 336 }}
        echarts={echarts}
        option={{
          series: [
            {
              type: 'pie',
              radius: '95%',
              data: props.data,
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)',
                },
              },
              label: {
                show: false,
              },
              itemStyle: {
                color: (params: { dataIndex: number }) => {
                  return params.dataIndex === 0 ? '#7BACE7' : '#C7DBF5';
                },
              },
            },
          ],
        }}
      />
    </div>
  );
};
export default Breakdown;
