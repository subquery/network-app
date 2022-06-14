// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Spinner, Typography } from '@subql/react-ui';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useIPFS, useProjectMetadata } from '../../containers';
import { useAsyncMemo } from '../../hooks';
import { ProjectMetadata } from '../../models';
import { getTrimmedStr, renderAsync } from '../../utils';
import IPFSImage from '../IPFSImage';
import { TableText } from '../TableText';
import styles from './DeploymentInfo.module.css';
import { GetOngoingServiceAgreements_serviceAgreements_nodes as ServiceAgreement } from '../../__generated__/registry/GetOngoingServiceAgreements';
import Copy from '../Copy';
import { getDeploymentMetadata } from '../../hooks/useDeploymentMetadata';

type Props = {
  project: ProjectMetadata;
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

  return (
    <div className={styles.projectInfo}>
      <IPFSImage src={project?.image || '/static/default.project.png'} className={styles.ipfsImage} />
      <div className={styles.projectTextInfo}>
        <Typography variant="large">{project.name}</Typography>
        <Typography variant="small" className={styles.text}>{`${
          deploymentMeta.data?.version && deploymentMeta.data?.version + ` - `
        }${t('projects.deploymentId')}: ${deploymentId ?? '-'}`}</Typography>
      </div>
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

// TODO: Migrate from SA page, see how can improve
export const VersionDeployment: React.VFC<{ deployment: ServiceAgreement['deployment'] }> = ({ deployment }) => {
  const { catSingle } = useIPFS();
  const meta = useAsyncMemo(
    () => getDeploymentMetadata(catSingle, deployment?.version),
    [deployment?.version, catSingle],
  );

  return (
    <TableText
      content={
        <div className={'flex'}>
          {`${meta.data?.version} - ${getTrimmedStr(deployment?.id)}`} <Copy value={deployment?.id} />
        </div>
      }
    />
  );
};
