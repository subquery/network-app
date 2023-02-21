// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useNavigate } from 'react-router';
import Modal from 'react-modal';
import { CreateInstructions, Spinner, ProjectCard, NewProject } from '../../../components';
import { useUserProjects, useWeb3 } from '../../../containers';
import { useProject } from '../../../hooks';
import { modalStyles, renderAsync } from '../../../utils';
import { Header } from '../../explorer/Home/Home';
import styles from './Home.module.css';
import { Button } from '@subql/react-ui';
import { ROUTES } from '../../../utils';
const { STUDIO_CREATE_NAV, STUDIO_PROJECT_NAV } = ROUTES;

const Project: React.VFC<{ projectId: string; account: string; onClick?: () => void }> = ({
  projectId,
  account,
  onClick,
}) => {
  const asyncProject = useProject(projectId);

  return (
    <div className={styles.card}>
      {renderAsync(asyncProject, {
        error: (e) => {
          console.log('ERROR loading project', e);
          return <span>{`Failed to load project: ${e.message}`}</span>;
        },
        loading: () => {
          return (
            <ProjectCard
              onClick={onClick}
              project={{
                id: projectId,
                owner: account,
              }}
            />
          );
          // return <span>{`Loading project id: ${projectId}`}</span>
        },
        data: (project) => {
          if (!project) return null;
          return <ProjectCard project={project} onClick={onClick} />;
        },
      })}
    </div>
  );
};

const Home: React.VFC = () => {
  const { account } = useWeb3();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = React.useState<boolean>(false);

  const asyncProjects = useUserProjects();

  const handleCreateProject = (name: string) => {
    navigate(`${STUDIO_CREATE_NAV}?name=${encodeURI(name)}`);
  };

  const enableCreateModal = () => setShowCreateModal(true);

  return (
    <div className="content-width">
      <Header renderRightItem={() => <Button type="primary" label="Create a project" onClick={enableCreateModal} />} />

      <Modal
        isOpen={showCreateModal}
        style={modalStyles}
        onRequestClose={() => setShowCreateModal(false)}
        closeTimeoutMS={200}
      >
        <NewProject onSubmit={handleCreateProject} onClose={() => setShowCreateModal(false)} />
      </Modal>

      {renderAsync(asyncProjects, {
        loading: () => <Spinner />,
        error: (error) => <p>{`Failed to load projects: ${error.message}`}</p>,
        data: (projects) => {
          if (!projects?.length) {
            return <CreateInstructions onClick={enableCreateModal} />;
          }

          return (
            <div className={styles.list}>
              {projects.map((id) => (
                <Project
                  projectId={id.toHexString()}
                  key={id.toHexString()}
                  onClick={() => navigate(`${STUDIO_PROJECT_NAV}/${id.toHexString()}`)}
                  account={account!}
                />
              ))}
            </div>
          );
        },
      })}
    </div>
  );
};

export default Home;
