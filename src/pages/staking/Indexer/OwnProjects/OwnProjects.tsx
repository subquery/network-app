// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Spinner, Typography } from '@subql/react-ui';
import { Table } from 'antd';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { IPFSImage, Status } from '../../../../components';
import { StatusColor } from '../../../../components/Status/Status';
import { useProjectMetadata } from '../../../../containers';
import { useAsyncMemo, useSortedIndexerDeployments } from '../../../../hooks';
import { renderAsync } from '../../../../utils';
import styles from './OwnProjects.module.css';

// TODO: Should this be moved to Status component?
const deploymentStatus: { [key: string]: StatusColor } = {
  INDEXING: StatusColor.blue,
  READY: StatusColor.green,
  NOTINDEXING: StatusColor.red,
};

interface Props {
  indexer: string;
}

export const OwnProjects: React.VFC<Props> = ({ indexer }) => {
  const { t } = useTranslation();
  const { getMetadataFromCid } = useProjectMetadata();
  const indexerDeployments = useSortedIndexerDeployments(indexer);

  const sortedResult = useAsyncMemo(async () => {
    if (!indexerDeployments.data) return [];
    return await Promise.all(
      indexerDeployments.data.map(async (indexerDeployment) => {
        const projectInfo = indexerDeployment.projectMeta
          ? await getMetadataFromCid(indexerDeployment.projectMeta)
          : { name: '', image: '' };
        const projectName = projectInfo?.name || indexerDeployment.projectId;
        const projectImage = projectInfo?.image;
        return { ...indexerDeployment, projectName, projectImage };
      }),
    );
  }, [indexerDeployments.loading]);

  const columns = [
    {
      title: '',
      dataIndex: 'deploymentId',
      key: 'deploymentId',
      width: '80%',
      render: (deploymentId: string, record: any) => (
        <div className={styles.projectInfo}>
          <IPFSImage src={record?.projectImage || '/static/default.project.png'} className={styles.ipfsImage} />
          <div className={styles.projectTextInfo}>
            <Typography variant="large">{`${record?.projectName}`}</Typography>
            <Typography variant="small" className={styles.text}>{`${t(
              'projects.deploymentId',
            )}: ${deploymentId}`}</Typography>
          </div>
        </div>
      ),
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
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

          return <Table columns={columns} dataSource={data} />;
        },
      })}
    </div>
  );
};
