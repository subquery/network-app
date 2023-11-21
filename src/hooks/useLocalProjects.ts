// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useRef, useState } from 'react';
import { useProjectMetadata } from '@containers';
import { ProjectFieldsFragment, ProjectsOrderBy } from '@subql/network-query';
import { useGetProjectsLazyQuery } from '@subql/react-hooks';
import { notEmpty } from '@utils';
import { filterSuccessPromoiseSettledResult } from '@utils';
import { makeCacheKey } from '@utils/limitation';
import { waitForSomething } from '@utils/waitForSomething';
import { useInterval, useMount } from 'ahooks';
import localforage from 'localforage';
import { uniqWith } from 'lodash-es';

const cacheKey = makeCacheKey('localProjectWithMetadata');

export const useLocalProjects = () => {
  // this hooks want to do these things:
  // 1. Get all projects order by order
  // 2. Save to indexDB
  // 3. Can be search
  // implements api:
  //  1. Get all projects
  //  2. Update by metadata cid
  //  3. loading & error status
  //  4. fetch all projects when mount.

  // Im not sure what bottle of this.
  // need to wait it come appearance
  const loading = useRef(false);
  const [error, setError] = useState<unknown>();
  const [getProjects] = useGetProjectsLazyQuery({
    variables: { offset: 0 },
  });
  const { getMetadataFromCid } = useProjectMetadata();

  const projects = useRef<
    ({ description: string; versionDescription: string; name: string } & ProjectFieldsFragment)[]
  >([]);

  const fetchAllProjects = async (length = 0) => {
    try {
      loading.current = true;

      const res = await getProjects({
        variables: {
          offset: length,
          orderBy: [ProjectsOrderBy.ID_DESC],
          ids: [],
        },
      });

      if (res.data?.projects?.nodes) {
        const nonEmptyProjects = res.data.projects?.nodes.filter(notEmpty);
        const allMetadata = await Promise.allSettled(nonEmptyProjects.map((i) => getMetadataFromCid(i.metadata)));
        const projectsWithMetadata = nonEmptyProjects.map((project, index) => {
          const rawMetadata = allMetadata[index];
          const metadata =
            rawMetadata.status === 'fulfilled'
              ? rawMetadata.value
              : { name: '', description: '', versionDescription: '' };
          return {
            ...project,
            ...metadata,
          };
        });
        const mergered = uniqWith([...projects.current, ...projectsWithMetadata], (x, y) => x.id === y.id);
        projects.current = mergered;
        await localforage.setItem(cacheKey, mergered);

        if (mergered.length >= res.data.projects.totalCount) {
          loading.current = false;
          return;
        }

        window.requestIdleCallback(() => fetchAllProjects(mergered.length));
      }
    } catch (e) {
      setError(e);
      loading.current = false;
    }
  };

  const init = async () => {
    // When first estiblish the local cache. We need to fetch all of it.
    // See fetchAllProject. It's a low-priority(requestsIdleCallback) fetch
    // if there have cache, just add & update metadata.
    const cached = await localforage.getItem<
      ({ description: string; versionDescription: string; name: string } & ProjectFieldsFragment)[]
    >(cacheKey);

    if (cached) {
      projects.current = cached;
      fetchAllProjects(cached.length);
      return;
    }
    fetchAllProjects();
  };

  const getProjectBySearch = async (params: { offset: number; keywords: string }) => {
    await waitForSomething({
      func: () => !loading.current,
    });
    const total = projects.current.filter((i) =>
      `${i.name}-${i.versionDescription}-${i.description}`.toLowerCase().includes(params.keywords.toLowerCase()),
    );

    return {
      data: {
        projects: {
          nodes: total.slice(params.offset, params.offset + 10),
          totalCount: total.length,
        },
      },
      error: null,
    };
  };

  const updateExistMetadata = async () => {
    await waitForSomething({ func: () => !loading.current });
    // IPFS can be cache. So fetch all of it would ok.
    const allMetadata = await Promise.allSettled(
      projects.current.map(async (i) => {
        const data = await getMetadataFromCid(i.metadata);
        return {
          [i.id]: data,
        };
      }),
    );
    const successData = allMetadata.filter(filterSuccessPromoiseSettledResult);

    const newProjectsData = projects.current.map((i) => {
      const find = successData.find((x) => x.value[i.id]);
      return {
        ...i,
        ...find,
      };
    });
    await localforage.setItem(cacheKey, newProjectsData);

    projects.current = newProjectsData;
  };

  useMount(() => {
    window.requestIdleCallback(() => init());
  });

  useInterval(() => {
    window.requestIdleCallback(() => updateExistMetadata());
  }, 60000);

  return {
    loading,
    error,
    getProjectBySearch,
  };
};
