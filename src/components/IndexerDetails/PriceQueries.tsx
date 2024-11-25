import { CSSProperties, useMemo } from 'react';
import LineChartWithMarkLine from '@components/LineChartWithMarkLine';
import { IIndexerFlexPlan, useConsumerHostServices } from '@hooks/useConsumerHostServices';
import { Typography } from '@subql/components';
import { useAsyncMemo } from '@subql/react-hooks';
import { formatNumber, formatSQT, parseError, renderAsync } from '@utils';
import { Skeleton } from 'antd';
import BigNumberJs from 'bignumber.js';
import dayjs from 'dayjs';
import { groupBy, unionBy } from 'lodash-es';

export const PriceQueriesChart = (props: {
  title?: string;
  dataDimensionsName?: string[];
  chartsStyle?: CSSProperties;
  skeletonHeight?: number;
  indexerAddress?: string;
  deploymentId?: string;
  flexPlanPrice?: IIndexerFlexPlan[];
}) => {
  const {
    title = 'Demand/Supply at each price point',
    chartsStyle,
    skeletonHeight,
    flexPlanPrice,
    deploymentId,
  } = props;

  const { getHostingPlanApi } = useConsumerHostServices({ autoLogin: false });

  const flexPlanGroupByPrice = useMemo(
    () =>
      Object.entries(
        groupBy(flexPlanPrice, (item) => {
          return formatSQT(BigNumberJs(item.price).multipliedBy(1000).toFixed(1));
        }),
      )
        .map((i) => [i[0], i[1].length])
        .sort((a, b) => Number(a[0]) - Number(b[0])) as [string, number][],
    [flexPlanPrice],
  );

  const hostingPlan = useAsyncMemo(async () => {
    const hostingPlanOfThisProject = await getHostingPlanApi({
      account: '0x31e99bda5939ba2e7528707507b017f43b67f89b',
    });

    return hostingPlanOfThisProject;
  }, []);

  const unfilledHostingPlan = useMemo(() => {
    if (hostingPlan.data) {
      const thisDeploymentPlan = hostingPlan.data.data.find((i) => {
        return i.deployment.deployment === deploymentId;
      });

      return [
        formatSQT(
          BigNumberJs(thisDeploymentPlan?.price.toString() || '0')
            .multipliedBy(1000)
            .toFixed(1),
          {
            toStringOrNumber: 'number',
          },
        ),
      ];
    }

    return [];
  }, [hostingPlan.data, deploymentId]);

  const seriesData = useMemo(() => {
    const sortedMarkLineData: [string, number][] = unfilledHostingPlan.map((i) => {
      return [`${i}`, 0];
    });

    return unionBy(flexPlanGroupByPrice, sortedMarkLineData, (i) => i[0]).sort((a, b) => Number(a[0]) - Number(b[0]));
  }, [flexPlanGroupByPrice, unfilledHostingPlan]);

  const markLineData = useMemo(() => {
    return unfilledHostingPlan.map((i) => {
      const index = seriesData.findIndex((j) => +j[0] === i);
      return {
        xAxis: index,
        count: 1,
      };
    });
  }, [seriesData]);

  return renderAsync(
    { loading: !!!flexPlanPrice, data: flexPlanPrice },
    {
      loading: () => (
        <Skeleton
          active
          paragraph={{ rows: 8 }}
          style={{ height: skeletonHeight ? skeletonHeight : 'auto', width: '50%', flexShrink: '0' }}
        ></Skeleton>
      ),
      error: (e) => {
        console.warn(e);
        return <Typography>{parseError(e)}</Typography>;
      },
      data: () => {
        return (
          <LineChartWithMarkLine
            seriesData={seriesData}
            markLineData={markLineData}
            style={chartsStyle}
            title={title}
            suffix={`Price Range (SQT per 1,000 queries)`}
            onTriggerTooltip={(index, data) => {
              const countBeforeThisData = seriesData.reduce((prev, current) => {
                if (+current[0] <= +data[0]) {
                  return prev + current[1];
                }

                return prev;
              }, 0);

              const indexOfThisData = seriesData.findIndex((i) => i[0] === data[0]);
              if (index === 0) {
                return `<div>No Operator supply of this price</div>`;
              }
              if (index > 4) {
                return `<div>No Consumer demand of this price</div>`;
              }
              return `<div class="col-flex" style="width: 280px; font-size: 12px;">
                <div class="flex-between">
                  <span>Total query supply</span>
                  <span>${countBeforeThisData}</span>
                </div>
                <div class="flex-between">
                  <span>Total consumer</span>
                  <span>${markLineData.find((i) => i.xAxis === indexOfThisData)?.count || 0}</span>
                </div>
              </div>`;
            }}
            customColors={['#4388DD', '#65CD45']}
          ></LineChartWithMarkLine>
        );
      },
    },
  );
};
