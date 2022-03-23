// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Spinner, Typography } from '@subql/react-ui';
import { Table, Progress } from 'antd';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { OwnDeployment, Status } from '../../../../components';
import { deploymentStatus } from '../../../../components/Status/Status';
import { useProjectMetadata } from '../../../../containers';
import { useAsyncMemo, useIndexerDeployments, useIndexerMetadata } from '../../../../hooks';
import { ProjectMetadata } from '../../../../models';
import { renderAsync, getDeploymentProgress } from '../../../../utils';
import { GetDeploymentIndexersByIndexer_deploymentIndexers_nodes as DeploymentIndexer } from '../../../../__generated__/GetDeploymentIndexersByIndexer';
import styles from './OwnDeployments.module.css';

interface Props {
  indexer: string;
}

export const OwnDeployments: React.VFC<Props> = ({ indexer }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const { getMetadataFromCid } = useProjectMetadata();
  const indexerDeployments = useIndexerDeployments(indexer);
  const indexerMetadata = useIndexerMetadata(indexer);
  const proxyEndpoint = indexerMetadata?.data?.url;

  const sortedResult = useAsyncMemo(async () => {
    if (!indexerDeployments.data) return [];
    return await Promise.all(
      indexerDeployments.data.map(async (indexerDeployment) => {
        const metadata: ProjectMetadata = indexerDeployment.deployment?.project
          ? await getMetadataFromCid(indexerDeployment.deployment.project.metadata)
          : { name: '', image: '', description: '', websiteUrl: '', codeUrl: '' };

        const deploymentId = indexerDeployment.deployment?.id;
        const indexingProgress = await getDeploymentProgress({
          proxyEndpoint,
          deploymentId: deploymentId,
        });

        return {
          ...indexerDeployment,
          indexingProgress,
          deploymentId,
          projectId: indexerDeployment.deployment?.project?.id,
          projectMeta: {
            ...metadata,
            name: metadata.name ?? indexerDeployment.deployment?.project?.id,
          },
        };
      }),
    );
  }, [indexerDeployments.loading]);

  const columns = [
    {
      title: '',
      dataIndex: 'deploymentId',
      width: '65%',
      render: (
        deploymentId: string,
        record: { projectId?: string; projectMeta: ProjectMetadata } & DeploymentIndexer,
      ) => <OwnDeployment deploymentId={deploymentId} project={record.projectMeta} />,
    },
    {
      title: 'PROGRESS',
      dataIndex: 'indexingProgress',
      width: '25%',
      render: (indexingProgress: number) => <Progress percent={+(indexingProgress * 100).toFixed(2)} size="small" />,
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      render: (status: string) => <Status text={status} color={deploymentStatus[status]} />,
    },
  ];

  return (
    <div className={styles.container}>
      {renderAsync(sortedResult, {
        error: (error) => <Typography>{`Failed to get projects: ${error.message}`}</Typography>,
        loading: () => <Spinner />,
        data: (data) => {
          if (!data || data.length === 0) return <Typography> {t('projects.nonDeployments')} </Typography>;

          return (
            <Table
              columns={columns}
              dataSource={data}
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
      })}
    </div>
  );
};
