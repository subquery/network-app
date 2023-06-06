// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Spinner, Typography } from '@subql/components';
import { ServiceAgreementFieldsFragment as ServiceAgreement } from '@subql/network-query';
import { Tooltip } from 'antd';

import { useIPFS, useProjectMetadata } from '../../containers';
import { useAsyncMemo } from '../../hooks';
import { getDeploymentMetadata } from '../../hooks/useDeploymentMetadata';
import { ProjectMetadata } from '../../models';
import { getTrimmedStr, renderAsync } from '../../utils';
import Copy from '../Copy';
import IPFSImage from '../IPFSImage';
import { TableText } from '../TableText';
import styles from './DeploymentInfo.module.css';

type Props = {
  project?: ProjectMetadata;
  deploymentId?: string;
  deploymentVersion?: string;
};

export const DeploymentInfo: React.FC<Props> = ({ project, deploymentId, deploymentVersion }) => {
  const { t } = useTranslation();
  const { catSingle } = useIPFS();
  const deploymentMeta = useAsyncMemo(async () => {
    if (!deploymentVersion) return null;
    return await getDeploymentMetadata(catSingle, deploymentVersion);
  }, [deploymentVersion, catSingle]);

  const versionHeader = deploymentMeta.data?.version
    ? `${deploymentMeta.data?.version} - ${t('projects.deploymentId')}:`
    : t('projects.deploymentId');

  return (
    <div className={styles.projectInfo}>
      <IPFSImage src={project?.image || '/static/default.project.png'} className={styles.ipfsImage} />

      <Tooltip title={deploymentId}>
        <div className={styles.projectTextInfo}>
          {project?.name && <Typography variant="large">{project?.name}</Typography>}
          <div className={project?.name ? '' : styles.deployment}>
            <Typography variant="small" className={styles.text}>
              {versionHeader}
            </Typography>

            <Copy value={deploymentId}>
              <Typography variant="small" className={styles.text}>
                {deploymentId ?? '-'}
              </Typography>
            </Copy>
          </div>
        </div>
      </Tooltip>
    </div>
  );
};

// TODO: Merge DeploymentMeta with DeploymentInfo
export const DeploymentMeta: React.FC<{ deploymentId: string; projectMetadata?: string }> = ({
  deploymentId,
  projectMetadata,
}) => {
  const { getMetadataFromCid } = useProjectMetadata();

  const metadata = useAsyncMemo(async () => {
    if (!projectMetadata) return null;
    return await getMetadataFromCid(projectMetadata);
  }, [projectMetadata]);

  return renderAsync(metadata, {
    loading: () => <Spinner />,
    error: (e) => <Typography>{`Failed to load project info: ${e}`}</Typography>,
    data: (projectMeta) => {
      if (!projectMeta) {
        return <Typography>Project metadata not found</Typography>;
      }

      return <DeploymentInfo deploymentId={deploymentId} project={projectMeta} />;
    },
  });
};

export const VersionDeployment: React.FC<{ deployment: ServiceAgreement['deployment'] }> = ({ deployment }) => {
  const { catSingle } = useIPFS();
  const deploymentVersion = deployment?.version;
  const meta = useAsyncMemo(async () => {
    if (!deploymentVersion) return null;
    return await getDeploymentMetadata(catSingle, deploymentVersion);
  }, [deploymentVersion, catSingle]);

  return (
    <TableText
      content={
        <Copy value={deployment?.id} position={'flex-start'}>
          {`${meta.data?.version ? meta.data?.version + ' - ' : ''}${getTrimmedStr(deployment?.id)}`}
        </Copy>
      }
    />
  );
};
