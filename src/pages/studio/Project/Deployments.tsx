// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ProjectDeployments } from '../../../components';
import { useDeploymentsQuery, useIPFS } from '../../../containers';
import { useAsyncMemo } from '../../../hooks';
import { mergeAsync, notEmpty, renderAsync } from '../../../utils';

const DeploymentsTab: React.VFC<{ projectId: string }> = ({ projectId }) => {
  const query = useDeploymentsQuery({ projectId });
  const ipfs = useIPFS();

  const asyncDeployments = useAsyncMemo(async () => {
    const projectDeployments = query.data?.projectDeployments?.nodes
      .filter(notEmpty)
      .map((v) => v.deployment)
      .filter(notEmpty);
    if (!projectDeployments) {
      return [];
    }

    return Promise.all(
      projectDeployments.map(async (deployment) => {
        const raw = await ipfs.catSingle(deployment.version);

        const { version, description } = JSON.parse(Buffer.from(raw).toString('utf8'));

        return {
          deploymentId: deployment.id,
          createdAt: deployment.createdAt,
          version,
          description,
        };
      }),
    );
  }, [query]);

  return renderAsync(mergeAsync(query, asyncDeployments), {
    loading: () => <div>Loading.....</div>,
    error: (e) => <div>{`Error: ${e.message}`}</div>,
    data: (data) => {
      if (!data) return null;
      const [_, deployments] = data;
      if (!deployments?.length) {
        return <div>Unable to find deployments for this project</div>;
      }

      return <ProjectDeployments deployments={deployments} />;
    },
  });
};

export default DeploymentsTab;
