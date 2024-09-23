import { CSSProperties } from 'react';
import BarCharts from '@components/BarCharts';
import { useEra } from '@hooks';
import { useConsumerHostServices } from '@hooks/useConsumerHostServices';
import { Typography } from '@subql/components';
import { useAsyncMemo } from '@subql/react-hooks';
import { formatNumber, formatSQT, parseError, renderAsync } from '@utils';
import { Skeleton } from 'antd';
import BigNumberJs from 'bignumber.js';
import dayjs from 'dayjs';

export const PriceQueriesChart = (props: {
  title?: string;
  dataDimensionsName?: string[];
  chartsStyle?: CSSProperties;
  skeletonHeight?: number;
  deploymentId?: string;
  indexerAddress?: string;
}) => {
  const { title = 'Queries by Price', chartsStyle, skeletonHeight, deploymentId } = props;
  const { currentEra } = useEra();

  const { getStatisticQueriesByPrice } = useConsumerHostServices({
    autoLogin: false,
  });

  const statisticPrice = useAsyncMemo(async () => {
    if (!deploymentId || !currentEra.data)
      return new Array(10).fill(0).map((_, i) => ({ price: `${0.5 * (i + 1)}`, queries: 0 }));
    const res = await getStatisticQueriesByPrice({
      deployment: [deploymentId],
      start_date: dayjs(currentEra.data?.eras?.at(1)?.startTime).format('YYYY-MM-DD'),
      end_date: currentEra.data?.eras?.at(1)?.endTime
        ? dayjs(currentEra.data?.eras?.at(1)?.endTime).format('YYYY-MM-DD')
        : undefined,
    });

    let rawData = res.data.sort((a, b) => BigNumberJs(a.price || 0).comparedTo(b.price || 0));
    const limitLength = 10;
    if (rawData.length > limitLength) {
      rawData = rawData.sort((a, b) => BigNumberJs(a.count || 0).comparedTo(b.count || 0)).slice(limitLength);
    }

    if (rawData.length < limitLength) {
      const lastPrice = BigNumberJs(rawData.at(-1)?.price || '0');
      rawData = [
        ...rawData,
        ...new Array(limitLength - rawData.length).fill(0).map((_, i) => ({
          price: lastPrice.plus(BigNumberJs(0.5 * (i + 1)).multipliedBy(10 ** 15)).toFixed(),
          queries: 0,
        })),
      ];
    }

    return rawData.map((i) => {
      return {
        price: formatSQT(
          BigNumberJs(i.price || '0')
            .multipliedBy(1000)
            .toFixed(2),
          {
            fixedNum: 2,
          },
        ) as string,
        queries: i.count,
      };
    });
  }, [deploymentId, currentEra.data]);

  return renderAsync(statisticPrice, {
    loading: () => (
      <Skeleton
        className="darkSkeleton"
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
        <BarCharts
          theme="dark"
          style={chartsStyle}
          xAxisScales={{
            rawData: statisticPrice.data || [],
            renderData: statisticPrice.data?.map((i) => i.price) || [],
          }}
          title={title}
          suffix={`Price Range (SQT per 1,000 queries)`}
          chartData={statisticPrice.data ? [statisticPrice.data?.map((i) => i.queries || 0)] : []}
          onTriggerTooltip={(index) => {
            return `<div class="col-flex" style="width: 280px; font-size: 12px;">
                <div class="flex-between" style="margin-top: 8px;">
                  <span>Total</span>
                  <span>${formatNumber(statisticPrice.data?.[index].queries || 0)}</span>
                </div>
              </div>`;
          }}
          customColors={['#4388DD', '#65CD45']}
        ></BarCharts>
      );
    },
  });
};
