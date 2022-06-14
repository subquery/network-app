// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ProgressBar, Spinner, Typography } from '@subql/react-ui';
import { Table } from 'antd';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { DeploymentInfo, Status } from '../../../../components';
import { deploymentStatus } from '../../../../components/Status/Status';
import { useSortedIndexerDeployments } from '../../../../hooks';
import { mapAsync, renderAsync } from '../../../../utils';
import styles from './OwnDeployments.module.css';

interface Props {
  indexer: string;
}

export const OwnDeployments: React.VFC<Props> = ({ indexer }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const indexerDeployments = useSortedIndexerDeployments(indexer);

  const columns = [
    {
      title: '',
      dataIndex: 'deploymentId',
      width: '65%',
      render: (deploymentId: string, record: any) => (
        <DeploymentInfo deploymentId={deploymentId} project={record.projectMeta} deploymentVersion={record.version} />
      ),
    },
    {
      title: 'PROGRESS',
      dataIndex: 'indexingProgress',
      width: '25%',
      render: (indexingProgress: number) => <ProgressBar progress={indexingProgress} />,
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      render: (status: string, deployment: any) => {
        let sortedStatus = status;
        if (deployment?.isOffline) {
          sortedStatus = 'OFFLINE' as string;
        }

        return <Status text={sortedStatus} color={deploymentStatus[sortedStatus]} />;
      },
    },
  ];

  return (
    <div className={styles.container}>
      {renderAsync(
        mapAsync((d) => {
          return d.sort((deployment) => (deployment.isOffline ? 1 : -1));
        }, indexerDeployments),
        {
          error: (error) => <Typography>{`Failed to get projects: ${error.message}`}</Typography>,
          loading: () => <Spinner />,
          data: (data) => {
            if (!data || data.length === 0) return <Typography> {t('projects.nonDeployments')} </Typography>;

            return (
              <Table
                columns={columns}
                dataSource={data}
                rowKey={'deploymentId'}
                onRow={(record) => {
                  return {
                    onClick: (event) => {
                      if (record.projectId) {
                        history.push(`/explorer/project/${record.projectId}/overview`);
                      }
                    },
                  };
                }}
              />
            );
          },
        },
      )}
    </div>
  );
};
