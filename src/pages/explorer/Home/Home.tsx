// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { ProjectFieldsFragment as Project } from '@subql/network-query';
import { useGetProjectsQuery } from '@subql/react-hooks';

import { ProjectCard, Spinner } from '../../../components';
import { useProjectMetadata } from '../../../containers';
import { useAsyncMemo, useOnScreen } from '../../../hooks';
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
export const Header: React.FC<{ renderRightItem?: () => React.ReactNode }> = ({ renderRightItem }) => {
  const { t } = useTranslation();
  return (
    <div className={styles.header}>
      <div>
        <p className={styles.headerTitle}>{t('explorer.home.header')}</p>
        <div className={styles.line} />
      </div>
      <div>{renderRightItem?.()}</div>
    </div>
  );
};

const Home: React.FC = () => {
  const { data, loading, error, fetchMore } = useGetProjectsQuery({
    variables: { offset: 0 },
  });
  const navigate = useNavigate();

  const bottom = React.useRef<HTMLDivElement>(null);
  const [endReached, setEndReached] = React.useState<boolean>(false);
  const projects = React.useMemo(() => data?.projects?.nodes.filter(notEmpty), [data]);
  const isBottomVisible = useOnScreen(bottom);

  // XXX untested
  React.useEffect(() => {
    if (isBottomVisible && !loading && !error && !endReached) {
      fetchMore({
        variables: {
          offset: data?.projects?.nodes.length,
        },
      }).then((res) => {
        if (!res.data.projects?.nodes.length) {
          setEndReached(true);
        }
      });
    }
  }, [isBottomVisible, loading, error, fetchMore, data, endReached]);

  return (
    <div className="content-width">
      <Header />
      {error && <span>{`We have an error: ${error.message}`}</span>}
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
      <div style={{ height: 1 }} ref={bottom} />
    </div>
  );
};

export default Home;
