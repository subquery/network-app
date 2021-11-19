// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useHistory } from 'react-router';
import { useProjectMetadata, useProjectsQuery } from '../../../containers';
import { GetProject_project as Project } from '../../../__generated__/GetProject';
import { useAsyncMemo } from '../../../hooks';
import { notEmpty } from '../../../utils';
import styles from './Home.module.css';
import { Spinner, ProjectCard } from '../../../components';

const ProjectItem: React.VFC<{ project: Project; onClick?: () => void }> = ({ project, onClick }) => {
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

const Home: React.VFC = () => {
  const { data, loading, error, fetchMore } = useProjectsQuery({ offset: 0 });
  const history = useHistory();

  const projects = React.useMemo(() => data?.projects?.nodes.filter(notEmpty), [data]);

  const handleLoadMore = () => {
    fetchMore({
      variables: {
        offset: data?.projects?.nodes.length,
      },
    });
  };

  return (
    <div>
      <p>Explorer Home</p>
      {error && <span>{`We have an error: ${error.message}`}</span>}
      {loading && <Spinner />}
      <div className={styles.list}>
        {projects?.length ? (
          projects.map((project) => (
            <ProjectItem
              project={project}
              key={project.id}
              onClick={() => history.push(`/explorer/project/${project.id}`)}
            />
          ))
        ) : (
          <span>No projects</span>
        )}
      </div>
    </div>
  );
};

export default Home;
