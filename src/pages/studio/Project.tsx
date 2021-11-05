// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useParams } from 'react-router';
import { ProjectDetail, ProjectHeader, Playground } from '../../components';
import { useProject } from '../../hooks';

const Project: React.VFC = () => {
  const { id } = useParams<{ id: string }>();

  const project = useProject(id);

  return (
    <div>
      {project ? <ProjectHeader project={project} /> : <span>Loading...</span>}
      {project && <ProjectDetail project={project} />}

      {project?.deployment && <Playground endpoint="" schema={project.deployment.schema} />}

      <p>{JSON.stringify(project)}</p>
    </div>
  );
};

export default Project;
