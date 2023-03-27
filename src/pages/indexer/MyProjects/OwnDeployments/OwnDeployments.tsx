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
import { renderAsync } from '../../../../utils';
import styles from './OwnDeployments.module.css';
import { ROUTES } from '../../../../utils';
import { TableTitle } from '@subql/components';
import { Description } from '../../../../components/Description/Description';
import { getDeploymentStatus } from '@utils/getIndexerStatus';

const { PROJECT_NAV } = ROUTES;

interface Props {
  indexer: string;
  emptyList?: React.ReactNode;
  desc?: string | React.ReactNode;
}

export const OwnDeployments: React.VFC<Props> = ({ indexer, emptyList, desc }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const indexerDeployments = useSortedIndexerDeployments(indexer);

  const columns: TableProps<UseSortedIndexerDeploymentsReturn>['columns'] = [
    {
      title: '',
      dataIndex: 'deploymentId',
      render: (deploymentId: string, deployment) => (
        <DeploymentInfo deploymentId={deploymentId} project={deployment.projectMeta} />
      ),
    },
    {
      title: <TableTitle title={t('general.progress')} />,
      dataIndex: 'indexingProgress',
      render: (indexingProgress: number, deployment) => {
        const { indexingProgressErr } = deployment;
        if (indexingProgressErr) return <Typography.Text type="danger">{indexingProgressErr}</Typography.Text>;
        return <ProgressBar progress={indexingProgress} />;
      },
    },
    {
      title: <TableTitle title={t('general.status')} />,
      dataIndex: 'status',
      render: (status, deployment) => {
        const sortedStatus = getDeploymentStatus(status, deployment.isOffline ?? false);
        return <Status text={sortedStatus} color={deploymentStatus[sortedStatus]} />;
      },
    },
  ];

  const sortedDesc = typeof desc === 'string' ? <Description desc={desc} /> : desc;

  return (
    <div className={styles.container}>
      {renderAsync(
        indexerDeployments,

        {
          error: (error) => (
            <Typography.Text type="danger">{`Failed to get projects: ${error.message}`}</Typography.Text>
          ),
          loading: () => <Spinner />,
          data: (data) => {
            if (!data || data.length === 0)
              return <>{emptyList ?? <Typography.Text> {t('projects.nonDeployments')} </Typography.Text>}</>;

            const sortedData = data.sort((deployment) => (deployment.isOffline ? 1 : -1));

            return (
              <>
                {sortedDesc && <div className={styles.desc}>{sortedDesc}</div>}
                <Table
                  columns={columns}
                  dataSource={sortedData}
                  rowKey={'deploymentId'}
                  onRow={(record) => {
                    return {
                      onClick: (_) => {
                        if (record.projectId) {
                          navigate(`${PROJECT_NAV}/${record.projectId}/overview`);
                        }
                      },
                    };
                  }}
                />
              </>
            );
          },
        },
      )}
    </div>
  );
};
