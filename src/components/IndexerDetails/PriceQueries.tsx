import { CSSProperties, useMemo } from 'react';
import LineChartWithMarkLine from '@components/LineChartWithMarkLine';
import { IIndexerFlexPlan, useConsumerHostServices } from '@hooks/useConsumerHostServices';
import { Typography } from '@subql/components';
import { useAsyncMemo } from '@subql/react-hooks';
import { formatSQT, parseError, renderAsync } from '@utils';
import { Skeleton } from 'antd';
import BigNumberJs from 'bignumber.js';
import { groupBy } from 'lodash-es';

export const PriceQueriesChart = (props: {
  title?: string;
  dataDimensionsName?: string[];
  chartsStyle?: CSSProperties;
  skeletonHeight?: number;
  indexerAddress?: string;

  // if no flexPlanPrice, then the deploymentId & projectId must be provided
  deploymentId?: string;
  projectId?: string;
  flexPlanPrice?: IIndexerFlexPlan[];
}) => {
  const {
    title = 'Supply at each price point',
    chartsStyle,
    skeletonHeight,
    flexPlanPrice,
    deploymentId,
    projectId,
  } = props;

  const { getProjects } = useConsumerHostServices({ autoLogin: false });

  const flexPlanPricesInner = useAsyncMemo(async () => {
    if (flexPlanPrice) return flexPlanPrice;
    if (!deploymentId || !projectId) return [];
    const res = await getProjects({
      projectId,
      deployment: deploymentId,
    });

    if (res?.data?.indexers) {
      return res.data.indexers;
    }

    return [];
  }, [flexPlanPrice, deploymentId, projectId]);

  const flexPlanGroupByPrice = useMemo(
    () =>
      Object.entries(
        groupBy(flexPlanPricesInner.data, (item) => {
          return formatSQT(BigNumberJs(item.price).multipliedBy(1000).toFixed(1));
        }),
      )
        .map((i) => [i[0], i[1].length])
        .sort((a, b) => Number(a[0]) - Number(b[0])) as [string, number][],
    [flexPlanPricesInner.data],
  );

  const seriesData = useMemo(() => {
    return flexPlanGroupByPrice;
  }, [flexPlanGroupByPrice]);

  return renderAsync(flexPlanPricesInner, {
    loading: () => (
      <Skeleton
        active
        paragraph={{ rows: 8 }}
        style={{ height: skeletonHeight ? skeletonHeight : 'auto', width: '100%', flexShrink: '0' }}
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
          markLineData={[]}
          style={chartsStyle}
          title={title}
          suffix={`Price Range (SQT per 1,000 queries)`}
          onTriggerTooltip={(index, data) => {
            return `<div class="col-flex" style="width: 280px; font-size: 12px;">
                <div class="flex-between">
                  <span>Total operator supply</span>
                  <span>${data[1]}</span>
                </div>
              </div>`;
          }}
          customColors={['#4388DD', '#65CD45']}
        ></LineChartWithMarkLine>
      );
    },
  });
};
