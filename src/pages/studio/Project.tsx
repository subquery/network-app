// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useParams } from 'react-router';
import Modal from 'react-modal';
import { ProjectDetail, ProjectHeader, Playground, NewDeployment } from '../../components';
import { useCreateDeployment, useProject } from '../../hooks';
import { NewDeployment as NewDeploymentParams } from '../../models';

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    borderRadius: '10px',
  },
  overlay: {
    zIndex: 50,
  },
};

const Project: React.VFC = () => {
  const { id } = useParams<{ id: string }>();

  const project = useProject(id);

  const [deploymentModal, setDeploymentModal] = React.useState<boolean>(false);
  const createDeployment = useCreateDeployment(id);

  const handleSubmitCreate = async (details: NewDeploymentParams) => {
    await createDeployment(details);

    setDeploymentModal(false);
  };

  const handleNewDeployment = () => setDeploymentModal(true);

  return (
    <div>
      <Modal isOpen={deploymentModal} style={customStyles} onRequestClose={() => setDeploymentModal(false)}>
        <NewDeployment onSubmit={handleSubmitCreate} />
      </Modal>
      {project ? <ProjectHeader project={project} onNewDeployment={handleNewDeployment} /> : <span>Loading...</span>}
      {project && <ProjectDetail project={project} onNewDeployment={handleNewDeployment} />}

      {project?.deployment && <Playground endpoint="" schema={project.deployment.schema} />}

      <p>{JSON.stringify(project)}</p>
    </div>
  );
};

export default Project;
