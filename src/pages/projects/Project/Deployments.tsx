// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { forwardRef, useImperativeHandle } from 'react';
import ProjectDeployments from '@components/ProjectDeployments';
import { Spinner } from '@subql/components';
import { useGetProjectDeploymentsLazyQuery } from '@subql/react-hooks';
import { uniqBy } from 'ramda';

import { useIPFS } from '../../../containers';
import { useAsyncMemo } from '../../../hooks';
import { getDeploymentMetadata } from '../../../hooks/useDeploymentMetadata';
import { notEmpty, renderAsync } from '../../../utils';

type Props = {
  projectId: string;
  currentDeployment?: {
    deployment: string;
    version: string;
  };
  onRefresh?: () => void;
};

export interface DeploymendRef {
  refresh: () => void;
}

const DeploymentsTab = forwardRef<DeploymendRef, Props>(({ projectId, currentDeployment, onRefresh }, ref) => {
  const [getProjDeployments] = useGetProjectDeploymentsLazyQuery({
    variables: {
      projectId,
    },
  });
  const { catSingle } = useIPFS();

  const asyncDeployments = useAsyncMemo(async () => {
    const res = await getProjDeployments({
      fetchPolicy: 'network-only',
    });
    let projectDeployments = res.data?.project?.deployments.nodes.filter(notEmpty);
    if (!projectDeployments) {
      return [];
    }

    if (currentDeployment && !projectDeployments.find((d) => d.id === currentDeployment.deployment)) {
      projectDeployments = uniqBy((d) => d.id + d.metadata, projectDeployments);
    }

    return Promise.all(
      projectDeployments.map(async (deployment) => {
        let result = { version: '', description: '' };
        try {
          result = (await getDeploymentMetadata(catSingle, deployment.metadata)) ?? result;
        } catch {
          console.error(`Failed to get deployment version for ${deployment.metadata}`);
        }

        return {
          deploymentId: deployment.id,
          createdAt: deployment.createdTimestamp,
          version: result.version,
          description: result.description,
          // TODO: backend support
          recommended: currentDeployment?.deployment === deployment.id,
        };
      }),
    );
  }, [currentDeployment]);

  useImperativeHandle(ref, () => ({
    refresh: async () => {
      await asyncDeployments.refetch();
      await onRefresh?.();
    },
  }));
  console.warn(currentDeployment);
  return renderAsync(asyncDeployments, {
    loading: () => <Spinner />,
    error: (e) => <div>{`Error: ${e.message}`}</div>,
    data: (deployments) => {
      if (!deployments) return null;
      if (!deployments?.length) {
        return <div>There has no deployments for this project</div>;
      }

      const sortedDeployments = deployments.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

      return (
        <ProjectDeployments
          currentDeploymentCid={currentDeployment?.deployment}
          deployments={sortedDeployments}
          projectId={projectId}
          onRefresh={async () => {
            await asyncDeployments.refetch();
            await onRefresh?.();
          }}
        />
      );
    },
  });
});

DeploymentsTab.displayName = 'DeploymentsTab';

export default DeploymentsTab;
