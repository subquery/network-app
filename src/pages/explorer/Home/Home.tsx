// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { SearchOutlined } from '@ant-design/icons';
import { useLocalProjects } from '@hooks/useLocalProjects';
import { Typography } from '@subql/components';
import { ProjectFieldsFragment as Project, ProjectsOrderBy } from '@subql/network-query';
import { useGetProjectLazyQuery, useGetProjectsLazyQuery } from '@subql/react-hooks';
import { useInfiniteScroll, useMount } from 'ahooks';
import { Input, Skeleton } from 'antd';

import { ProjectCard } from '../../../components';
import { useProjectMetadata } from '../../../containers';
import { useAsyncMemo } from '../../../hooks';
import { notEmpty } from '../../../utils';
import { ROUTES } from '../../../utils';
import styles from './Home.module.css';

const { PROJECT_NAV } = ROUTES;

const ProjectItem: React.FC<{ project: Project; onClick?: () => void }> = ({ project, onClick }) => {
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

// TODO move to components
export const Header: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className={styles.header}>
      <Typography variant="h3">{t('explorer.home.header')}</Typography>
      <Typography style={{ width: 439, textAlign: 'center', marginTop: 16 }} type="secondary">
        {t('explorer.home.headerDesc')}
      </Typography>
    </div>
  );
};

const Home: React.FC = () => {
  const [getProjects, { error }] = useGetProjectsLazyQuery({
    variables: { offset: 0 },
  });

  const [getProject, { error: topError }] = useGetProjectLazyQuery();

  const navigate = useNavigate();
  const [searchKeywords, setSearchKeywords] = React.useState('');
  const [topProject, setTopProject] = React.useState<Project>();
  const [projects, setProjects] = React.useState<Project[]>([]);
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
            offset: options?.refresh ? 0 : projects.length,
            keywords: searchKeywords,
          }
        : {
            variables: {
              offset: options?.refresh ? 0 : projects.length,
              orderBy: [ProjectsOrderBy.TOTAL_REWARD_DESC, ProjectsOrderBy.UPDATED_TIMESTAMP_DESC],
              ids: ['0x06'],
            },
          };

      // The type define at top.
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const res = await api(params);

      let updatedLength = projects.length;
      // implement a sorting for projects
      if (res.data?.projects?.nodes) {
        // it seems have something wrong with TypeScript
        // filter once or twice is the same.
        const nonEmptyProjects = res.data.projects?.nodes.filter(notEmpty).filter(notEmpty);
        const mergered = options?.refresh ? [...nonEmptyProjects] : [...projects, ...nonEmptyProjects];
        setProjects(mergered);
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
    threshold: 300,
  });

  useMount(() => {
    if (import.meta.env.MODE !== 'testnet') {
      loadTopProject();
    }
  });

  return (
    <div className={styles.explorer}>
      <Header />
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
          onChange={(e) => {
            setSearchKeywords(e.target.value);
          }}
        ></Input>
      </div>
      <div className={styles.list}>
        {!inSearchMode && topProject ? (
          <ProjectItem
            project={topProject}
            key={topProject.id}
            onClick={() => navigate(`${PROJECT_NAV}/${topProject.id}`)}
          />
        ) : !inSearchMode ? (
          <Skeleton paragraph={{ rows: 7 }} style={{ width: 236, height: 400 }} active></Skeleton>
        ) : (
          ''
        )}
        {projects?.length
          ? projects.map((project) => (
              <ProjectItem
                project={project}
                key={project.id}
                onClick={() => navigate(`${PROJECT_NAV}/${project.id}`)}
              />
            ))
          : ''}
        {loading &&
          new Array(projects.length + 10 <= total ? 10 : total - projects.length).fill(0).map((_, i) => {
            return <Skeleton paragraph={{ rows: 7 }} active key={i} style={{ width: 236, height: 400 }}></Skeleton>;
          })}
      </div>

      {inSearchMode && !projects.length && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Typography>No projects match your search</Typography>
        </div>
      )}

      {(error || topError) && <span>{`We have an error: ${error?.message || topError?.message}`}</span>}
    </div>
  );
};

export default Home;
