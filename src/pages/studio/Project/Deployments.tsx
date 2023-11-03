// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useGetProjectDeploymentsQuery } from '@subql/react-hooks';
import { uniqBy } from 'ramda';

import { ProjectDeployments, Spinner } from '../../../components';
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
};

const DeploymentsTab: React.FC<Props> = ({ projectId, currentDeployment }) => {
  const query = useGetProjectDeploymentsQuery({
    variables: {
      projectId,
    },
  });
  const { catSingle } = useIPFS();

  const asyncDeployments = useAsyncMemo(async () => {
    let projectDeployments = query.data?.project?.deployments.nodes.filter(notEmpty);
    if (!projectDeployments) {
      return [];
    }

    if (currentDeployment && !projectDeployments.find((d) => d.id === currentDeployment.deployment)) {
      projectDeployments = uniqBy(
        (d) => d.id + d.metadata,
        [
          {
            __typename: 'Deployment',
            id: currentDeployment.deployment,
            metadata: currentDeployment.version,
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
          result = (await getDeploymentMetadata(catSingle, deployment.metadata)) ?? result;
        } catch {
          console.error(`Failed to get deployment version for ${deployment.metadata}`);
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
