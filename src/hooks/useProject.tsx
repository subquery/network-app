// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import yaml from 'js-yaml';
import { ProjectManifestVersioned, VersionedProjectManifest } from '@subql/common';
import { useIPFS, useProjectMetadata, useQueryRegistry } from '../containers';
import { ProjectDetails } from '../models';
import { buildSchema } from '../utils';

export function useProject(id: string): ProjectDetails | undefined {
  const { getQuery } = useQueryRegistry();
  const { catSingle } = useIPFS();
  const { getMetadataFromCid } = useProjectMetadata();

  const [project, setProject] = React.useState<ProjectDetails>();

  const getDeployment = async (deploymentId: string): Promise<ProjectDetails['deployment']> => {
    const manifest = await catSingle(deploymentId)
      .then((data) => Buffer.from(data).toString())
      .then((str) => yaml.load(str))
      .then((obj) => {
        const manifest = new ProjectManifestVersioned(obj as VersionedProjectManifest);
        manifest.validate();

        return manifest;
      });

    const schema = await catSingle(manifest.schema.replace('ipfs://', ''))
      .then((data) => Buffer.from(data).toString())
      .then((str) => buildSchema(str));

    return {
      id: deploymentId,
      manifest,
      schema,
    };
  };

  const loadProject = React.useCallback(async () => {
    if (!id) {
      setProject(undefined);
      return;
    }

    const query = await getQuery(id);
    if (!query) {
      setProject(undefined);
      return;
    }

    const metadata = await getMetadataFromCid(query.metadata);

    const deployment = await getDeployment(query.deployment);

    setProject({
      id,
      metadata,
      deployment,
    });
  }, [id, catSingle, getMetadataFromCid, getQuery]);

  React.useEffect(() => {
    loadProject();
  }, [loadProject]);

  return project;
}
