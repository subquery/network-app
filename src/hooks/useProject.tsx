// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import yaml from 'js-yaml';
import { ProjectManifestVersioned, VersionedProjectManifest } from '@subql/common';
import { useIPFS, useProjectMetadata, useQueryRegistry } from '../containers';
import { ProjectMetadata } from '../models';

type ProjectDetails = {
  metadata: ProjectMetadata;
  manifest: ProjectManifestVersioned;
};

export function useProject(id: string): { id: string; project: ProjectDetails | undefined } {
  const { getQuery } = useQueryRegistry();
  const { catSingle } = useIPFS();
  const { getMetadataFromCid } = useProjectMetadata();

  const [project, setProject] = React.useState<ProjectDetails>();

  const loadProject = React.useCallback(async () => {
    if (!id) {
      setProject(undefined);
      return;
    }

    const query = await getQuery(id);

    const [metadata, manifest] = await Promise.all([
      getMetadataFromCid(query.metadata),

      // TODO use reader once https://github.com/subquery/subql/pull/511 is released
      catSingle(query.deployment)
        .then((data) => Buffer.from(data).toString())
        .then((str) => yaml.load(str))
        .then((obj) => {
          const manifest = new ProjectManifestVersioned(obj as VersionedProjectManifest);
          manifest.validate();

          return manifest;
        }),
    ]);

    // TODO load more info like project status

    setProject({
      metadata,
      manifest,
    });
  }, [id]);

  React.useEffect(() => {
    loadProject();
  }, [loadProject]);

  return {
    id,
    project,
  };
}
