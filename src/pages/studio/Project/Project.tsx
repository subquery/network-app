// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Redirect, Route, Switch, useParams } from 'react-router';
import Modal from 'react-modal';
import { NavLink } from 'react-router-dom';
import { ProjectDetail, ProjectHeader, NewDeployment, ProjectDeployments, Button } from '../../../components';
import { useAsyncMemo, useCreateDeployment, useProject } from '../../../hooks';
import { NewDeployment as NewDeploymentParams } from '../../../models';
import { useDeploymentsQuery, useIPFS } from '../../../containers';
import styles from './Project.module.css';

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

const DeploymentsTab: React.VFC<{ projectId: string }> = ({ projectId }) => {
  const { data, loading, error } = useDeploymentsQuery({ projectId });
  const ipfs = useIPFS();

  const {
    data: deployments,
    loading: loadingVersion,
    error: errorVersion,
  } = useAsyncMemo(async () => {
    if (!data?.projectDeployments.nodes) {
      return [];
    }

    return Promise.all(
      data.projectDeployments.nodes.map(async ({ deployment }) => {
        const raw = await ipfs.catSingle(deployment.version);

        const { version, description } = JSON.parse(Buffer.from(raw).toString('utf8'));

        return {
          deploymentId: deployment.id,
          createdAt: deployment.createdAt,
          version,
          description,
        };
      }),
    );
  }, [data]);

  if (loading || loadingVersion) {
    return <div>Loading.....</div>;
  }

  if (error || errorVersion) {
    return <div>{`Error: ${error || errorVersion}`}</div>;
  }

  if (!deployments?.length) {
    return <div>Unable to find deployments for this project</div>;
  }

  return <ProjectDeployments deployments={deployments} />;
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

  const handleEditMetadata = () => {
    /* TODO*/
  };

  if (!project) {
    return <span>Loading....</span>;
  }

  return (
    <div>
      <Modal isOpen={deploymentModal} style={customStyles} onRequestClose={() => setDeploymentModal(false)}>
        <NewDeployment onSubmit={handleSubmitCreate} />
      </Modal>
      <ProjectHeader project={project} />
      <div className="tabContainer">
        <NavLink to={`/studio/project/${id}/details`} className="tab" activeClassName="tabSelected" title="Details">
          Details
        </NavLink>
        <NavLink
          to={`/studio/project/${id}/deployments`}
          className="tab"
          activeClassName="tabSelected"
          title="Deployments"
        >
          Deployments
        </NavLink>
      </div>
      <Switch>
        <Route exact path={`/studio/project/:id/details`}>
          {project.metadata && <ProjectDetail metadata={project.metadata} onEdit={handleEditMetadata} />}
        </Route>
        <Route exact path={`/studio/project/:id/deployments`}>
          <div className={styles.deployments}>
            <DeploymentsTab projectId={id} />
            <Button
              type="primary"
              label="Create new deployment"
              className={styles.deployButton}
              onClick={handleNewDeployment}
            />
          </div>
        </Route>
        <Redirect from="/:id" to={`${id}/details`} />
      </Switch>
    </div>
  );
};

export default Project;
