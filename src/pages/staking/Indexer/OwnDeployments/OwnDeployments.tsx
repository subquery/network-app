// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ProgressBar, Spinner } from '@subql/react-ui';
import { Table, TableProps, Typography } from 'antd';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { DeploymentInfo, Status } from '../../../../components';
import { deploymentStatus } from '../../../../components/Status/Status';
import { useSortedIndexerDeployments, UseSortedIndexerDeploymentsReturn } from '../../../../hooks';
import { mapAsync, renderAsync } from '../../../../utils';
import styles from './OwnDeployments.module.css';

interface Props {
  indexer: string;
}

export const OwnDeployments: React.VFC<Props> = ({ indexer }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const indexerDeployments = useSortedIndexerDeployments(indexer);

  const columns: TableProps<UseSortedIndexerDeploymentsReturn>['columns'] = [
    {
      title: '',
      dataIndex: 'deploymentId',
      width: '65%',
      render: (deploymentId: string, deployment) => (
        <DeploymentInfo deploymentId={deploymentId} project={deployment.projectMeta} />
      ),
    },
    {
      title: 'PROGRESS',
      dataIndex: 'indexingProgress',
      width: '25%',
      render: (indexingProgress: number, deployment) => {
        const { indexingProgressErr } = deployment;
        if (indexingProgressErr) return <Typography.Text type="danger">{indexingProgressErr}</Typography.Text>;
        return <ProgressBar progress={indexingProgress} />;
      },
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      render: (status: string, deployment) => {
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
          error: (error) => (
            <Typography.Text type="danger">{`Failed to get projects: ${error.message}`}</Typography.Text>
          ),
          loading: () => <Spinner />,
          data: (data) => {
            if (!data || data.length === 0) return <Typography.Text> {t('projects.nonDeployments')} </Typography.Text>;

            return (
              <Table
                columns={columns}
                dataSource={data}
                rowKey={'deploymentId'}
                onRow={(record) => {
                  return {
                    onClick: (event) => {
                      if (record.projectId) {
                        navigate(`/explorer/project/${record.projectId}/overview`);
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
