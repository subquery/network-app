// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ProjectDeployments, Spinner } from '../../../components';
import { useDeploymentsQuery, useIPFS } from '../../../containers';
import { useAsyncMemo } from '../../../hooks';
import { notEmpty, renderAsync } from '../../../utils';
import { uniqBy } from 'ramda';
import { getDeploymentMetadata } from '../../../hooks/useDeploymentMetadata';

type Props = {
  projectId: string;
  currentDeployment?: {
    deployment: string;
    version: string;
  };
};

const DeploymentsTab: React.FC<Props> = ({ projectId, currentDeployment }) => {
  const query = useDeploymentsQuery({ projectId });
  const { catSingle } = useIPFS();

  const asyncDeployments = useAsyncMemo(async () => {
    let projectDeployments = query.data?.project?.deployments.nodes.filter(notEmpty);
    if (!projectDeployments) {
      return [];
    }

    if (currentDeployment && !projectDeployments.find((d) => d.id === currentDeployment.deployment)) {
      projectDeployments = uniqBy(
        (d) => d.id + d.version,
        [
          {
            __typename: 'Deployment',
            id: currentDeployment.deployment,
            version: currentDeployment.version,
            createdTimestamp: new Date(), // TODO come up with a timestamp
          },
          ...projectDeployments,
        ],
      );
    }

    return Promise.all(
      projectDeployments.map(async (deployment) => {
        let result = { version: '', description: '' };
        try {
          result = (await getDeploymentMetadata(catSingle, deployment.version)) ?? result;
        } catch {
          console.error(`Failed to get deployment version for ${deployment.version}`);
        }

        return {
          deploymentId: deployment.id,
          createdAt: deployment.createdTimestamp,
          version: result.version,
          description: result.description,
        };
      }),
    );
  }, [query, currentDeployment]);

  return renderAsync(asyncDeployments, {
    loading: () => <Spinner />,
    error: (e) => <div>{`Error: ${e.message}`}</div>,
    data: (deployments) => {
      if (!deployments) return null;
      if (!deployments?.length) {
        return <div>There has no deployments for this project</div>;
      }

      return <ProjectDeployments deployments={deployments} />;
    },
  });
};

export default DeploymentsTab;
