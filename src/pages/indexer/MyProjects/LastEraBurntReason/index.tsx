import React, { FC, useMemo } from 'react';
import { gql, useQuery } from '@apollo/client';
import { TOP_100_INDEXERS } from '@containers';
import { TableTitle, Typography } from '@subql/components';
import { Table } from 'antd';
import dayjs from 'dayjs';

import styles from './index.module.less';

interface IProps {
  indexerAddress: string;
  deploymentId: string;
}

const LastEraBurntReason: FC<IProps> = ({ indexerAddress, deploymentId }) => {
  const burentReasons = useQuery<{
    getIndexerServiceRequestHistoryV2: {
      endpointErrorMsg: string;
      times: number[];
    }[];
  }>(
    gql`
      query getReasons($indexer: String!, $deploymentId: String!) {
        getIndexerServiceRequestHistoryV2(indexer: $indexer, deploymentId: $deploymentId) {
          endpointErrorMsg
          times
        }
      }
    `,
    {
      variables: {
        indexer: indexerAddress,
        deploymentId,
      },
      context: {
        clientName: TOP_100_INDEXERS,
      },
    },
  );

  const renderData = useMemo(() => {
    return burentReasons.data?.getIndexerServiceRequestHistoryV2
      .map((i) => {
        return i.times.map((time) => ({
          reason: i.endpointErrorMsg,
          date: dayjs(Math.floor(time * 1000)).format('YYYY-MM-DD HH:mm:ss'),
          timestamp: time,
        }));
      })
      .flat()
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [burentReasons.data?.getIndexerServiceRequestHistoryV2]);

  return (
    <div>
      <Table
        columns={[
          {
            title: <TableTitle>Unhealthy reason</TableTitle>,
            dataIndex: 'reason',
            render: (val: string) => {
              return <Typography>{val}</Typography>;
            },
          },
          {
            title: <TableTitle>Date</TableTitle>,
            dataIndex: 'date',
            render: (val: string) => {
              return <Typography>{val}</Typography>;
            },
            sorter(a, b) {
              return a.timestamp - b.timestamp;
            },
          },
        ]}
        rowKey={(record, index) => `${record.reason}${record.timestamp}${index}`}
        loading={burentReasons.loading}
        dataSource={renderData}
      ></Table>
    </div>
  );
};
export default LastEraBurntReason;
