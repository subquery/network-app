// Copyright 2020-2022 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ProjectDeployments, Spinner } from '../../../components';
import { useDeploymentsQuery, useIPFS } from '../../../containers';
import { useAsyncMemo } from '../../../hooks';
import { mergeAsync, notEmpty, renderAsync } from '../../../utils';
import { uniqBy } from 'ramda';
import { getDeploymentMetadata } from '../../../hooks/useDeploymentMetadata';

type Props = {
  projectId: string;
  currentDeployment?: {
    deployment: string;
    version: string;
  };
};

const DeploymentsTab: React.VFC<Props> = ({ projectId, currentDeployment }) => {
  const query = useDeploymentsQuery({ projectId });
  const { catSingle } = useIPFS();

  const asyncDeployments = useAsyncMemo(async () => {
    let projectDeployments = query.data?.projectDeployments?.nodes
      .filter(notEmpty)
      .map((v) => v.deployment)
      .filter(notEmpty);
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
        const result = await getDeploymentMetadata(catSingle, deployment.version);

        return {
          deploymentId: deployment.id,
          createdAt: deployment.createdTimestamp,
          version: result?.version ?? '',
          description: result?.description ?? '',
        };
      }),
    );
  }, [query, currentDeployment]);

  return renderAsync(mergeAsync(query, asyncDeployments), {
    loading: () => <Spinner />,
    error: (e) => <div>{`Error: ${e.message}`}</div>,
    data: (data) => {
      if (!data) return null;
      const [, deployments] = data;
      if (!deployments?.length) {
        return <div>Unable to find deployments for this project</div>;
      }

      return <ProjectDeployments deployments={deployments} />;
    },
  });
};

export default DeploymentsTab;
