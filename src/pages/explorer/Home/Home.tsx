// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useHistory } from 'react-router';
import ProjectCard from '../../../components/ProjectCard';
import { useProjectMetadata, useProjectsQuery } from '../../../containers';
import { Project } from '../../../containers/QueryRegistryProject';
import { useAsyncMemo } from '../../../hooks';
import styles from './Home.module.css';

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
  const { data, loading, error } = useProjectsQuery({ offset: 0 });
  const history = useHistory();

  return (
    <div>
      <p>Explorer Home</p>
      {error && <span>{`We have an error: ${error.message}`}</span>}
      {loading && <span>...loading</span>}
      <div className={styles.list}>
        {data?.projects.nodes.length ? (
          data.projects.nodes.map((project) => (
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
