// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useMemo } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { ProjectCard } from '@components';
import { useProjectMetadata } from '@containers';
import { ProjectFieldsFragment, ProjectsOrderBy } from '@subql/network-query';
import { useAsyncMemo, useGetProjectLazyQuery, useGetProjectsLazyQuery } from '@subql/react-hooks';
import { notEmpty } from '@utils';
import { useInfiniteScroll, useMount } from 'ahooks';
import { Input, Skeleton, Typography } from 'antd';

import { useLocalProjects } from './useLocalProjects';
import styles from './useProjectList.module.less';

const ProjectItem: React.FC<{ project: ProjectFieldsFragment; onClick?: () => void }> = ({ project, onClick }) => {
  const { getMetadataFromCid } = useProjectMetadata();

  const { data: metadata } = useAsyncMemo(() => getMetadataFromCid(project.metadata), [project]);

  return (
    <ProjectCard
      onClick={onClick}
      project={{
        ...project,
        metadata,
      }}
    />
  );
};

export interface UseProjectListProps {
  account?: string;
  showTopProject?: boolean;
  onProjectClick?: (projectId: string) => void;
}

export const useProjectList = (props: UseProjectListProps = {}) => {
  const { account, showTopProject, onProjectClick } = props;
  const [getProjects, { error }] = useGetProjectsLazyQuery({
    variables: { offset: 0 },
  });

  const [getProject, { error: topError }] = useGetProjectLazyQuery();

  const [searchKeywords, setSearchKeywords] = React.useState('');
  const [topProject, setTopProject] = React.useState<ProjectFieldsFragment>();
  const [projects, setProjects] = React.useState<ProjectFieldsFragment[]>([]);
  // ref for fetch, state for render.
  const fetchedProejcts = React.useRef<ProjectFieldsFragment[]>([]);
  // Note why don't use Apollo client's loading.
  // Apollo client's loading seems have some delay.
  // If use it would not update by project's update.
  // would give a flush for user.
  const [loading, setLoading] = React.useState(false);
  // assum there at lease have 11 projects
  const [total, setTotal] = React.useState(10);
  const [inSearchMode, setInSearchMode] = React.useState(false);

  const { getProjectBySearch } = useLocalProjects();

  const loadTopProject = async () => {
    // this is a hard code, for kepler-network project.
    // we want to top it.
    const res = await getProject({
      variables: {
        id: '0x06',
      },
    });
    if (res.data?.project) {
      setTopProject(res.data?.project);
    }
  };

  const loadMore = async (options?: { refresh?: boolean }) => {
    try {
      setLoading(true);
      if (searchKeywords.length) {
        setInSearchMode(true);
      } else {
        setInSearchMode(false);
      }
      const api = searchKeywords.length ? getProjectBySearch : getProjects;

      const params = searchKeywords.length
        ? {
            offset: options?.refresh ? 0 : fetchedProejcts.current.length,
            keywords: searchKeywords,
          }
        : {
            variables: {
              offset: options?.refresh ? 0 : fetchedProejcts.current.length,
              orderBy: [ProjectsOrderBy.TOTAL_REWARD_DESC, ProjectsOrderBy.UPDATED_TIMESTAMP_DESC],
              ids: showTopProject ? ['0x06'] : [],
            },
            defaultOptions: { fetchPolicy: 'network-only' },
          };
      // The type define at top.
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const res = await api(params);

      let updatedLength = fetchedProejcts.current.length;
      // implement a sorting for projects
      if (res.data?.projects?.nodes) {
        // it seems have something wrong with TypeScript
        // filter once or twice is the same.
        const nonEmptyProjects = res.data.projects?.nodes.filter(notEmpty).filter(notEmpty);
        const mergered = options?.refresh ? [...nonEmptyProjects] : [...fetchedProejcts.current, ...nonEmptyProjects];
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
    }
  };

  const { mutate } = useInfiniteScroll(() => loadMore(), {
    target: document,
    isNoMore: (d) => !!d?.isNoMore,
    threshold: 500,
  });

  const topProjectItem = useMemo(() => {
    if (!showTopProject) return '';
    if (!inSearchMode && topProject)
      return (
        <ProjectItem
          project={topProject}
          key={topProject.id}
          onClick={() => {
            onProjectClick?.(topProject.id);
          }}
        />
      );

    if (!inSearchMode) return <Skeleton paragraph={{ rows: 7 }} style={{ width: 236, height: 400 }} active></Skeleton>;

    return '';
  }, [inSearchMode, topProject, showTopProject, onProjectClick]);

  const listsWithSearch = useMemo(() => {
    return (
      <>
        <div style={{ display: 'flex', marginBottom: 32 }}>
          <span style={{ flex: 1 }}></span>
          <Input
            style={{ width: 200, height: 48, padding: 12 }}
            prefix={<SearchOutlined style={{ color: 'var(--sq-gray500)' }} />}
            placeholder="Search"
            onKeyUp={async (e) => {
              if (e.key.toUpperCase() === 'ENTER') {
                setProjects([]);
                const res = await loadMore({ refresh: true });
                mutate(res);
              }
            }}
            disabled={loading}
            onChange={(e) => {
              setSearchKeywords(e.target.value);
            }}
          ></Input>
        </div>
        <div className={styles.list}>
          {topProjectItem}
          {projects?.length
            ? projects.map((project) => (
                <ProjectItem
                  project={project}
                  key={project.id}
                  onClick={() => {
                    onProjectClick?.(project.id);
                  }}
                />
              ))
            : // TODO: update UI
            loading
            ? ''
            : 'No projects'}
          {loading &&
            new Array(projects.length + 10 <= total ? 10 : total - projects.length).fill(0).map((_, i) => {
              return <Skeleton paragraph={{ rows: 7 }} active key={i} style={{ width: 236, height: 400 }}></Skeleton>;
            })}
        </div>

        {inSearchMode && !loading && !projects.length && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Typography>No projects match your search</Typography>
          </div>
        )}

        {(error || topError) && <span>{`We have an error: ${error?.message || topError?.message}`}</span>}
      </>
    );
  }, [error, inSearchMode, topError, loading, projects, onProjectClick]);

  useMount(() => {
    if (showTopProject) {
      loadTopProject();
    }
  });

  return {
    listsWithSearch,
    loading,
  };
};
