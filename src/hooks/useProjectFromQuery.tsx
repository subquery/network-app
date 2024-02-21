// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useState } from 'react';
import { ProjectFieldsFragment as Project } from '@subql/network-query';
import { useGetProjectQuery } from '@subql/react-hooks';
import dayjs from 'dayjs';

import { useProjectMetadata } from '../containers';
import { ProjectMetadata } from '../models';
import { AsyncData } from '../utils';
import { useAsyncMemo } from '.';

export type ProjectDetailsQuery = Omit<Project, 'metadata' | '__typename'> & {
  metadata: ProjectMetadata;
};

export function useProjectFromQuery(id: string): AsyncData<ProjectDetailsQuery> {
  const { getMetadataFromCid } = useProjectMetadata();
  const [now] = useState(dayjs().utc(true).toDate());
  const { data, loading, error } = useGetProjectQuery({
    variables: {
      id,
      now,
    },
  });

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
    };
  }, [data, getMetadataFromCid]);

  return {
    data: project,
    error: error || errorData,
    loading: loading || loadingData,
  };
}
