// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import UnsafeWarn from '@components/UnsafeWarn';
import { useGetIfUnsafeDeployment } from '@hooks/useGetIfUnsafeDeployment';
import { ChatBoxTooltip, Spinner, Typography } from '@subql/components';
import { ProjectType } from '@subql/contract-sdk/types';
import { clsx } from 'clsx';
import { toSvg } from 'jdenticon';

import { useChatBoxStore } from 'src/stores/chatbox';

import { useProjectMetadata } from '../../containers';
import { useAsyncMemo } from '../../hooks';
import { useDeploymentMetadata } from '../../hooks/useDeploymentMetadata';
import { ProjectMetadata } from '../../models';
import { isUndefined, parseError, renderAsync } from '../../utils';
import Copy from '../Copy';
import IPFSImage from '../IPFSImage';
import styles from './DeploymentInfo.module.css';

type Props = {
  project?: ProjectMetadata;
  deploymentId?: string;
  deploymentVersion?: string;
  type?: ProjectType;
  maxWidth?: string;
  onClick?: () => void;
};

export const DeploymentInfo: React.FC<Props> = ({ project, deploymentId, type, maxWidth = '200px', onClick }) => {
  const { t } = useTranslation();

  const deploymentMeta = useDeploymentMetadata(deploymentId);
  const { isUnsafe } = useGetIfUnsafeDeployment(deploymentId);
  const versionHeader = deploymentMeta.data?.version
    ? `${deploymentMeta.data?.version} - ${t('projects.deploymentId')}:`
    : t('projects.deploymentId');

  const chatBoxStore = useChatBoxStore();

  return (
    <ChatBoxTooltip
      options={[
        {
          label: 'What flex plan price should I set?',
          value: `What flex plan price should I set for project deployment ${deploymentId}?`,
        },
        {
          label: 'How should I allocate my SQT to this deployment?',
          value: `How much SQT should I allocated to deployment ${deploymentId}?`,
        },
      ]}
      chatBoxInstance={chatBoxStore.chatBoxRef}
    >
      <div className={styles.projectInfo}>
        <IPFSImage
          src={project?.image || `data:image/svg+xml;utf8,${encodeURIComponent(toSvg(project?.name, 500))}`}
          className={styles.ipfsImage}
        />

        <div
          className={styles.projectTextInfo}
          onClick={() => {
            onClick && onClick();
          }}
        >
          <div style={{ display: 'flex', height: 22 }}>
            {project?.name && (
              <Typography
                className={clsx('overflowEllipsis', styles.link)}
                variant="large"
                style={{ marginRight: 10, width: '100%', maxWidth: maxWidth }}
              >
                {project?.name}
              </Typography>
            )}
            {isUnsafe && <UnsafeWarn></UnsafeWarn>}
          </div>
          {isUndefined(type) ? (
            ''
          ) : (
            <div>
              <Typography variant="small" className={styles.text}>
                Type: {type === ProjectType.RPC ? 'RPC Endpoint' : 'Indexed Dataset'}
              </Typography>
            </div>
          )}
          <div className={project?.name ? '' : styles.deployment}>
            <Typography variant="small" className={clsx(styles.text, 'overflowEllipsis')} style={{ maxWidth: 200 }}>
              {versionHeader}
            </Typography>

            <Copy value={deploymentId} position="flex-start">
              <Typography variant="small" className={styles.text}>
                {deploymentId
                  ? `${deploymentId.slice(0, 5)}...${deploymentId.slice(deploymentId.length - 5, deploymentId.length)}`
                  : '-'}
              </Typography>
            </Copy>
          </div>
        </div>
      </div>
    </ChatBoxTooltip>
  );
};

// TODO: Merge DeploymentMeta with DeploymentInfo
export const DeploymentMeta: React.FC<{ deploymentId: string; projectMetadata?: string; maxWidth?: string }> = ({
  deploymentId,
  projectMetadata,
  maxWidth,
}) => {
  const { getMetadataFromCid } = useProjectMetadata();

  const metadata = useAsyncMemo(async () => {
    if (!projectMetadata) return null;
    return await getMetadataFromCid(projectMetadata);
  }, [projectMetadata]);

  return renderAsync(metadata, {
    loading: () => <Spinner />,
    error: (e) => <Typography>{`Failed to load project info: ${parseError(e)}`}</Typography>,
    data: (projectMeta) => {
      if (!projectMeta) {
        return <Typography>Project metadata not found</Typography>;
      }

      return <DeploymentInfo deploymentId={deploymentId} project={projectMeta} maxWidth={maxWidth} />;
    },
  });
};
