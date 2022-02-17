// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useHistory } from 'react-router';
import Modal from 'react-modal';
import { CreateInstructions, Spinner, ProjectCard, NewProject, ConnectWallet } from '../../../components';
import { useUserProjects, useWeb3 } from '../../../containers';
import { injectedConntector } from '../../../containers/Web3';
import { useProject } from '../../../hooks';
import { modalStyles, renderAsync } from '../../../utils';
import { Header } from '../../explorer/Home/Home';
import styles from './Home.module.css';
import { Button } from '@subql/react-ui';

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
  const { account, activate } = useWeb3();
  const history = useHistory();
  const [showCreateModal, setShowCreateModal] = React.useState<boolean>(false);

  const handleConnectWallet = React.useCallback(async () => {
    if (account) return;

    try {
      await activate(injectedConntector);
    } catch (e) {
      console.log('Failed to activate wallet', e);
    }
  }, [activate, account]);

  const asyncProjects = useUserProjects();

  const handleCreateProject = (name: string) => {
    history.push(`/studio/create?name=${encodeURI(name)}`);
  };

  const enableCreateModal = () => setShowCreateModal(true);

  if (!account) {
    return (
      <div className={styles.container}>
        <ConnectWallet onConnect={handleConnectWallet} />
      </div>
    );
  }

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
                  onClick={() => history.push(`/studio/project/${id.toHexString()}`)}
                  account={account}
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
