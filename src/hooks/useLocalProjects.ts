// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useRef, useState } from 'react';
import { useProjectMetadata } from '@containers';
import { ProjectFieldsFragment, ProjectsOrderBy, ProjectType } from '@subql/network-query';
import { useGetProjectsLazyQuery } from '@subql/react-hooks';
import { notEmpty } from '@utils';
import { makeCacheKey } from '@utils/limitation';
import { waitForSomething } from '@utils/waitForSomething';
import { useMount } from 'ahooks';
import localforage from 'localforage';
import { uniqWith } from 'lodash-es';
import { cloneDeep } from 'lodash-es';

import { Manifest, useGetDeploymentManifest } from './useGetDeploymentManifest';

// clear previous cache
const previousCacheKey = makeCacheKey('localProjectWithMetadata');
localforage.removeItem(previousCacheKey);
const cacheKey = makeCacheKey('localProjectWithMetadata-1');

type ProjectWithMetadata = {
  description: string;
  versionDescription: string;
  name: string;
  categories?: string[];
} & ProjectFieldsFragment & {
    manifest?: Manifest;
  };

const requestIdle = window.requestIdleCallback || setTimeout;

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
  const { getManifest } = useGetDeploymentManifest();

  const projects = useRef<ProjectWithMetadata[]>([]);

  const fetchAllProjects = async (cachedProjects?: ProjectWithMetadata[], withLoading = true) => {
    const innerFetch: (fetchedProjects: ProjectWithMetadata[]) => Promise<ProjectWithMetadata[]> = async (
      fetchedProjects,
    ) => {
      let tempProjects = cloneDeep(fetchedProjects) || [];

      try {
        if (withLoading) {
          loading.current = true;
        }

        const res = await getProjects({
          variables: {
            offset: tempProjects.length,
            orderBy: [ProjectsOrderBy.ID_ASC],
            ids: [],
            type: [ProjectType.RPC, ProjectType.SUBGRAPH, ProjectType.SUBQUERY],
          },
          defaultOptions: {
            fetchPolicy: 'network-only',
          },
        });

        if (res.data?.projects?.nodes) {
          const nonEmptyProjects = res.data.projects?.nodes.filter(notEmpty);
          const allMetadata = await Promise.allSettled(nonEmptyProjects.map((i) => getMetadataFromCid(i.metadata)));
          const allManifest = await Promise.allSettled(
            nonEmptyProjects.map((i) => {
              if (i.type === ProjectType.RPC) {
                return getManifest(i.deploymentId);
              }

              return Promise.resolve({});
            }),
          );
          const projectsWithMetadata = nonEmptyProjects.map((project, index) => {
            const rawMetadata = allMetadata[index];
            const rawManifest = allManifest[index];
            const metadata =
              rawMetadata.status === 'fulfilled'
                ? rawMetadata.value
                : { name: '', description: '', versionDescription: '', categories: [] };
            const manifest = rawManifest.status === 'fulfilled' ? rawManifest.value : {};
            return {
              ...project,
              ...metadata,
              manifest,
            };
          });
          const mergered = uniqWith([...tempProjects, ...projectsWithMetadata], (x, y) => x.id === y.id);
          tempProjects = mergered;
          if (mergered.length >= res.data.projects.totalCount) {
            loading.current = false;
            return tempProjects;
          }

          return await innerFetch(tempProjects);
        }
      } catch (e) {
        setError(e);
        loading.current = false;
        return tempProjects;
      }

      return tempProjects;
    };

    const res = await innerFetch(cachedProjects || []);

    projects.current = res;
    await localforage.setItem(cacheKey, res);
  };

  const init = async () => {
    // When first estiblish the local cache. We need to fetch all of it.
    // See fetchAllProject. It's a low-priority(requestsIdleCallback) fetch
    // if there have cache, use cache first, and then fetch from initial to update.
    const cached = await localforage.getItem<
      ({
        description: string;
        versionDescription: string;
        name: string;
        categories?: string[];
      } & ProjectFieldsFragment)[]
    >(cacheKey);
    if (cached) {
      projects.current = cached;
      await fetchAllProjects(cached);
      // update for next search
      requestIdle(() => fetchAllProjects([], false));
      return;
    }
    fetchAllProjects();
  };

  const getProjectBySearch = async (params: {
    offset: number;
    keywords: string;
    categories?: string[];
    projectType: ProjectType;
  }) => {
    await waitForSomething({
      func: () => !loading.current,
    });
    let total = projects.current.filter((i) =>
      `${i.name}-${i.versionDescription}-${i.description}`.toLowerCase().includes(params.keywords.toLowerCase()),
    );

    if (params.categories && params.categories.length) {
      const setCategories = new Set(params.categories);
      total = total.filter((i) => {
        if (setCategories.has('Subgraph')) {
          return i.type === ProjectType.SUBGRAPH;
        }

        if (params.projectType === ProjectType.RPC) {
          return params.categories?.some((ii) => i.name.includes(ii));
        }

        if (!i.categories) return false;
        return i.categories?.filter((ii) => setCategories.has(ii)).length;
      });
    }

    if (params.projectType) {
      total = total.filter((i) => {
        if (Array.isArray(params.projectType)) {
          return params.projectType.includes(i.type);
        }
        return i.type === params.projectType;
      });
    }

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

  useMount(async () => {
    requestIdle(() => init());
  });

  return {
    loading,
    error,
    getProjectBySearch,
  };
};
