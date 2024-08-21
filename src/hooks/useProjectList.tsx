// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import { ProjectCard } from '@components';
import RpcError from '@components/RpcError';
import { useProjectMetadata } from '@containers';
import { PublishNewProjectModal } from '@pages/projects/Home/Home';
import { SubqlCheckbox } from '@subql/components';
import { ProjectFieldsFragment, ProjectsOrderBy, ProjectType } from '@subql/network-query';
import { useAsyncMemo, useGetProjectLazyQuery, useGetProjectsLazyQuery } from '@subql/react-hooks';
import { categoriesOptions, notEmpty, rpcCategoriesOptions } from '@utils';
import { useInfiniteScroll } from 'ahooks';
import { Button, Input, Radio, Skeleton, Typography } from 'antd';

import { useGetDeploymentManifest } from './useGetDeploymentManifest';
import { useLocalProjects } from './useLocalProjects';
import styles from './useProjectList.module.less';

const ProjectItem: React.FC<{
  project: ProjectFieldsFragment;
  makeRedirectHref?: (projectId: string) => string;
  onClick?: () => void;
}> = ({ project, makeRedirectHref, onClick }) => {
  const { getMetadataFromCid } = useProjectMetadata();
  const { manifest } = useGetDeploymentManifest(project.type === ProjectType.RPC ? project.deploymentId : '');

  const { data: metadata } = useAsyncMemo(() => getMetadataFromCid(project.metadata), [project]);

  return (
    <ProjectCard
      href={makeRedirectHref ? makeRedirectHref(project.id) : undefined}
      onClick={onClick}
      project={{
        ...project,
        metadata,
        manifest,
      }}
    />
  );
};

export interface UseProjectListProps {
  account?: string;
  showTopProject?: boolean;
  onProjectClick?: (projectId: string) => void;
  defaultFilterProjectType?: ProjectType;
  makeRedirectHref?: (projectId: string) => string;
}

export const useProjectList = (props: UseProjectListProps = {}) => {
  const {
    account,
    showTopProject,
    defaultFilterProjectType = ProjectType.SUBQUERY,
    makeRedirectHref,
    onProjectClick,
  } = props;
  const [, setSearchParams] = useSearchParams();
  const [getProjects, { error }] = useGetProjectsLazyQuery({
    variables: { offset: 0, type: [ProjectType.SUBQUERY, ProjectType.SUBGRAPH] },
  });

  const [getProject, { error: topError, loading: topLoading }] = useGetProjectLazyQuery();

  const [searchKeywords, setSearchKeywords] = React.useState('');
  const [filterCategories, setFilterCategories] = useState<string[]>([]);
  const [filterProjectType, setFilterProjectType] = useState<ProjectType>(defaultFilterProjectType);
  const [topProject, setTopProject] = React.useState<ProjectFieldsFragment>();
  const [projects, setProjects] = React.useState<ProjectFieldsFragment[]>([]);
  // ref for fetch, state for render.
  const fetchedProejcts = React.useRef<ProjectFieldsFragment[]>([]);
  // Note why don't use Apollo client's loading.
  // Apollo client's loading seems have some delay.
  // If use it would not update by project's update.
  // would give a flush for user.
  const [loading, setLoading] = React.useState(false);
  const loadingStatusForDebounce = useRef(false);
  // assum there at lease have 11 projects
  const [total, setTotal] = React.useState(10);
  const [inSearchMode, setInSearchMode] = React.useState(false);
  const [showPublishModal, setShowPublishModal] = React.useState(false);

  const { getProjectBySearch } = useLocalProjects();

  // const loadTopProject = async () => {
  //   // this is a hard code, for kepler-network project.
  //   // we want to top it.
  //   const res = await getProject({
  //     variables: {
  //       id: '0x06',
  //     },
  //   });
  //   if (res.data?.project) {
  //     setTopProject(res.data?.project);
  //   }
  // };

  const loadMore = async (options?: {
    refresh?: boolean;
    searchParams?: { categories?: string[]; keywords?: string; projectType?: ProjectType };
  }) => {
    if (loading || loadingStatusForDebounce.current) {
      return {
        list: [],
        isNoMore: false,
      };
    }
    try {
      setLoading(true);
      loadingStatusForDebounce.current = true;
      // TODO: If there have more params, need to optimise
      const searchParams = {
        keywords: searchKeywords,
        categories: filterCategories,
        // TODO: Need refactor.
        projectType:
          filterProjectType === ProjectType.SUBQUERY ? [ProjectType.SUBQUERY, ProjectType.SUBGRAPH] : filterProjectType,
        ...options?.searchParams,
      };
      const isSearch = searchParams.categories.length || searchParams.keywords.length;

      if (isSearch) {
        setInSearchMode(true);
      } else {
        setInSearchMode(false);
      }
      const api = isSearch ? getProjectBySearch : getProjects;
      const params = isSearch
        ? {
            offset: options?.refresh ? 0 : fetchedProejcts.current.length,
            ...searchParams,
          }
        : {
            variables: {
              offset: options?.refresh ? 0 : fetchedProejcts.current.length,
              orderBy: [ProjectsOrderBy.TOTAL_REWARD_DESC, ProjectsOrderBy.UPDATED_TIMESTAMP_DESC],
              ids: showTopProject ? ['0x06'] : [],
              type: searchParams.projectType,
            },
            defaultOptions: { fetchPolicy: 'network-only' },
          };
      // The type define at top.

      // @ts-ignore
      const res = await api(params);

      let updatedLength = fetchedProejcts.current.length;
      // implement a sorting for projects
      if (res.data?.projects?.nodes) {
        // it seems have something wrong with TypeScript
        // filter once or twice is the same.
        const nonEmptyProjects = res.data.projects?.nodes.filter(notEmpty).filter(notEmpty);
        const mergered = options?.refresh ? [...nonEmptyProjects] : [...fetchedProejcts.current, ...nonEmptyProjects];
        // TODO: filter by backend.
        setProjects(mergered.filter((proj) => (account ? account.toLowerCase() === proj.owner.toLowerCase() : true)));
        fetchedProejcts.current = mergered;
        updatedLength = mergered.length;
        setTotal(res.data?.projects?.totalCount);
      }

      return {
        list: [],
        isNoMore: res.error || !res.data?.projects?.nodes.length || updatedLength >= res.data.projects.totalCount,
      };
    } finally {
      setLoading(false);
      loadingStatusForDebounce.current = false;
    }
  };

  const { mutate } = useInfiniteScroll(() => loadMore(), {
    target: document,
    isNoMore: (d) => !!d?.isNoMore,
    threshold: 300,
  });

  const topProjectItem = useMemo(() => {
    if (!showTopProject || inSearchMode) return '';
    if (topProject)
      return (
        <ProjectItem
          project={topProject}
          key={topProject.id}
          onClick={() => {
            onProjectClick?.(topProject.id);
          }}
        />
      );

    if (topLoading) return <Skeleton paragraph={{ rows: 7 }} style={{ width: 236, height: 400 }} active></Skeleton>;

    return '';
  }, [inSearchMode, topProject, topLoading, showTopProject, onProjectClick]);

  const projectListItems = useMemo(() => {
    const loadingItems = new Array(
      projects.length + 10 <= total ? 10 : total - projects.length < 0 ? 0 : total - projects.length,
    )
      .fill(0)
      .map((_, i) => {
        return <Skeleton paragraph={{ rows: 7 }} active key={i} style={{ width: 236, height: 400 }}></Skeleton>;
      });
    if (projects.length) {
      return (
        <>
          {projects.map((project) => (
            <ProjectItem
              project={project}
              key={project.id}
              makeRedirectHref={makeRedirectHref}
              onClick={
                onProjectClick
                  ? () => {
                      onProjectClick(project.id);
                    }
                  : undefined
              }
            />
          ))}
          {loading && loadingItems}
        </>
      );
    } else {
      if (loading) return loadingItems;
    }

    return '';
  }, [inSearchMode, loading, projects, onProjectClick]);

  const emptyResult = useMemo(() => {
    if (error) return <RpcError></RpcError>;
    if (loading || topLoading) return '';
    if (inSearchMode && !projects.length)
      return (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Typography>No projects match your search</Typography>
        </div>
      );

    if (!inSearchMode && !projects.length && !topProject)
      return (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Typography>No projects</Typography>
        </div>
      );
  }, [loading, inSearchMode, projects, topProject, showTopProject, topLoading, error]);

  const listsWithSearch = useMemo(() => {
    return (
      <>
        <div className={styles.typeFilter}>
          <Radio.Group
            options={[
              { label: 'Indexed Datasets', value: ProjectType.SUBQUERY },
              { label: 'RPC Endpoints', value: ProjectType.RPC },
            ]}
            onChange={async (val) => {
              if (loading) return;
              setSearchParams({
                category: val.target.value === ProjectType.RPC ? 'rpc' : 'subquery',
              });
              setFilterProjectType(val.target.value);
              setFilterCategories([]);
              setProjects([]);
              setTotal(10);
              const res = await loadMore({
                refresh: true,
                searchParams: {
                  projectType: val.target.value,
                  categories: [],
                },
              });
              mutate(res);
            }}
            value={filterProjectType}
            optionType="button"
            buttonStyle="solid"
            size="large"
            disabled={loading}
          />
          {filterProjectType === ProjectType.RPC ? null : (
            <Button
              style={{ alignSelf: 'flex-end' }}
              type="primary"
              shape="round"
              size="large"
              onClick={() => {
                setShowPublishModal(true);
              }}
            >
              Publish Your Own Project
            </Button>
          )}
          <PublishNewProjectModal
            value={showPublishModal}
            onChange={(val) => {
              setShowPublishModal(val);
            }}
          ></PublishNewProjectModal>
        </div>
        <div className={styles.projectType}>
          <div>
            <SubqlCheckbox.Group
              disabled={loading}
              value={filterCategories}
              options={
                filterProjectType === ProjectType.RPC
                  ? rpcCategoriesOptions
                  : [
                      ...categoriesOptions,
                      {
                        label: 'Subgraph',
                        value: 'Subgraph',
                      },
                    ]
              }
              onChange={async (val) => {
                if (loading) return;
                setFilterCategories(val as string[]);
                setProjects([]);
                setTotal(10);

                const res = await loadMore({
                  refresh: true,
                  searchParams: {
                    categories: val as string[],
                  },
                });
                mutate(res);
              }}
              optionType="button"
            ></SubqlCheckbox.Group>
          </div>
          <span style={{ flex: 1 }}></span>
          <Input
            className={styles.search}
            prefix={<SearchOutlined style={{ color: 'var(--sq-gray500)' }} />}
            placeholder="Search"
            onKeyUp={async (e) => {
              if (e.key.toUpperCase() === 'ENTER') {
                setProjects([]);
                const res = await loadMore({
                  refresh: true,
                });
                mutate(res);
              }
            }}
            value={searchKeywords}
            disabled={loading}
            onChange={(e) => {
              setSearchKeywords(e.target.value);
            }}
          ></Input>
        </div>
        <div className={styles.list}>
          {topProjectItem}
          {projectListItems}
        </div>

        {emptyResult}
      </>
    );
  }, [
    error,
    inSearchMode,
    topError,
    filterCategories,
    showPublishModal,
    filterProjectType,
    searchKeywords,
    loading,
    projects,
    onProjectClick,
  ]);

  return {
    listsWithSearch,
    loading,
    projects,
  };
};
