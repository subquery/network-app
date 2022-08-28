// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useProjectMetadata, useProjectQuery } from '../containers';
import { ProjectDeployment, ProjectMetadata } from '../models';
import { AsyncData } from '../utils';
import { useAsyncMemo } from '.';
import { GetProject_project as Project } from '../__generated__/registry/GetProject';

type ProjectDetailsQuery = Omit<Project, 'metadata' | '__typename'> & {
  metadata: ProjectMetadata;
  deployment?: ProjectDeployment;
};

export function useProjectFromQuery(id: string): AsyncData<ProjectDetailsQuery> {
  const { getMetadataFromCid } = useProjectMetadata();

  const { data, loading, error } = useProjectQuery({ id });

  const {
    data: project,
    loading: loadingData,
    error: errorData,
  } = useAsyncMemo<ProjectDetailsQuery | undefined>(async () => {
    if (!data?.project) {
      return undefined;
    }

    const query = data.project;
    const metadata = await getMetadataFromCid(query.metadata);

    return {
      ...query,
      metadata,
      deployment: undefined,
    };
  }, [data, getMetadataFromCid]);

  return {
    data: project,
    error: error || errorData,
    loading: loading || loadingData,
  };
}
