// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { SearchOutlined } from '@ant-design/icons';
import { Typography } from '@subql/components';
import { ProjectFieldsFragment as Project } from '@subql/network-query';
import { useGetProjectsLazyQuery } from '@subql/react-hooks';
import { useInfiniteScroll } from 'ahooks';
import { Input } from 'antd';

import { ProjectCard, Spinner } from '../../../components';
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
    <div className={styles.card}>
      <ProjectCard
        onClick={onClick}
        project={{
          ...project,
          metadata,
        }}
      />
    </div>
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
  const [getProjects, { error, loading }] = useGetProjectsLazyQuery({
    variables: { offset: 0 },
  });
  const navigate = useNavigate();

  const [projects, setProjects] = React.useState<Project[]>([]);

  const loadMore = async () => {
    const res = await getProjects({
      variables: {
        offset: projects.length,
      },
    });

    if (res.data?.projects?.nodes) {
      setProjects([...projects, ...res.data.projects?.nodes.filter(notEmpty)]);
    }

    return {
      list: [],
      isNoMore: !res.error && !res.data?.projects?.nodes.length,
    };
  };

  useInfiniteScroll(() => loadMore(), {
    target: document,
    isNoMore: (d) => !!d?.isNoMore,
    threshold: 300,
  });

  return (
    <div className={styles.explorer}>
      <Header />
      {error && <span>{`We have an error: ${error.message}`}</span>}

      <div style={{ display: 'flex', marginBottom: 32 }}>
        <span style={{ flex: 1 }}></span>
        <Input
          style={{ width: 200, height: 48, padding: 12 }}
          prefix={<SearchOutlined style={{ color: 'var(--sq-gray500)' }} />}
          placeholder="Search"
          onKeyUp={(e) => {
            if (e.key.toUpperCase() === 'ENTER') {
              console.warn('search');
            }
          }}
        ></Input>
      </div>
      <div className={styles.list}>
        {projects?.length
          ? projects.map((project) => (
              <ProjectItem
                project={project}
                key={project.id}
                onClick={() => navigate(`${PROJECT_NAV}/${project.id}`)}
              />
            ))
          : !loading && <span>No projects</span>}
      </div>
      {loading && <Spinner />}
    </div>
  );
};

export default Home;
