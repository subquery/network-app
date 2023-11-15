// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Typography } from '@subql/components';
import { ProjectFieldsFragment as Project, ProjectsOrderBy } from '@subql/network-query';
import { useGetProjectLazyQuery, useGetProjectsLazyQuery } from '@subql/react-hooks';
import { useInfiniteScroll, useMount } from 'ahooks';
import { Skeleton } from 'antd';

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

  const [topProject, setTopProject] = React.useState<Project>();
  const [projects, setProjects] = React.useState<Project[]>([]);
  // Note why don't use Apollo client's loading.
  // Apollo client's loading seems have some delay.
  // If use it would not update by project's update.
  // would give a flush for user.
  const [loading, setLoading] = React.useState(false);
  // assum there at lease have 11 projects
  const [total, setTotal] = React.useState(10);
  const updateNetworkProject = async () => {
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

  const loadMore = async () => {
    try {
      setLoading(true);
      const res = await getProjects({
        variables: {
          offset: projects.length,
          orderBy: [ProjectsOrderBy.TOTAL_REWARD_DESC, ProjectsOrderBy.UPDATED_TIMESTAMP_DESC],
          ids: ['0x06'],
        },
      });

      let updatedLength = projects.length;
      // implement a sorting for projects
      if (res.data?.projects?.nodes) {
        const nonEmptyProjects = res.data.projects?.nodes.filter(notEmpty);
        const mergered = [...projects, ...nonEmptyProjects];
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

  useInfiniteScroll(() => loadMore(), {
    target: document,
    isNoMore: (d) => !!d?.isNoMore,
    threshold: 300,
  });

  useMount(() => {
    if (import.meta.env.MODE !== 'testnet') {
      updateNetworkProject();
    }
  });

  return (
    <div className={styles.explorer}>
      <Header />

      <div className={styles.list}>
        {topProject ? (
          <ProjectItem
            project={topProject}
            key={topProject.id}
            onClick={() => navigate(`${PROJECT_NAV}/${topProject.id}`)}
          />
        ) : (
          <Skeleton paragraph={{ rows: 7 }} style={{ width: 236, height: 400 }} active></Skeleton>
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

      {(error || topError) && <span>{`We have an error: ${error?.message || topError?.message}`}</span>}
    </div>
  );
};

export default Home;
