import { CSSProperties, useMemo } from 'react';
import { DiscordOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { cloneDeep } from '@apollo/client/utilities';
import DoBooster from '@components/DoBooster';
import LineChartWithMarkLine from '@components/LineChartWithMarkLine';
import { IIndexerFlexPlan, useConsumerHostServices } from '@hooks/useConsumerHostServices';
import { Typography } from '@subql/components';
import { useAsyncMemo } from '@subql/react-hooks';
import { formatSQT, numToHex, parseError, renderAsync } from '@utils';
import { Alert, Button, Skeleton } from 'antd';
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
    const copyData = cloneDeep(flexPlanGroupByPrice);
    flexPlanGroupByPrice.forEach((_, index) => {
      if (index > 0) {
        copyData[index][1] += copyData[index - 1][1];
      }
    });

    return copyData;
  }, [flexPlanGroupByPrice]);

  const BoosterWarning = useMemo(() => {
    return (
      <Alert
        message={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <InfoCircleOutlined style={{ color: 'var(--sq-warning)' }} />
              <Typography variant="large" weight={500}>
                No operator available
              </Typography>
            </div>
          </div>
        }
        description={
          <div style={{ marginTop: 8 }}>
            <Typography type="secondary">
              To attract more operators, consider increasing your{' '}
              <DoBooster
                projectId={numToHex(+(projectId || 0))}
                deploymentId={deploymentId}
                actionBtnStyle={{ display: 'inline' }}
                actionBtn={<Typography.Link type="info">Booster</Typography.Link>}
              ></DoBooster>{' '}
              or reach out to operators directly on{' '}
              <Typography.Link
                type="info"
                href="https://discord.com/channels/796198414798028831/1209780719489130526"
                target="_blank"
              >
                Discord
              </Typography.Link>
              .
            </Typography>
          </div>
        }
        type="warning"
        showIcon={false}
        style={{
          marginBottom: 16,
          border: '1px solid var(--sq-warning)',
          backgroundColor: 'rgba(255, 193, 7, 0.1)',
        }}
      />
    );
  }, [deploymentId, projectId]);

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
      if (!seriesData.length) {
        return BoosterWarning;
      }
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
          emptyDesc="No Operator supply data to display"
        ></LineChartWithMarkLine>
      );
    },
  });
};
