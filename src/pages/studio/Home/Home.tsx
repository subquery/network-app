// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useHistory } from 'react-router';
import { Button, NewProjectCard } from '../../../components';
import ProjectCard from '../../../components/ProjectCard';
import { useUserProjects, useWeb3 } from '../../../containers';
import { injectedConntector } from '../../../containers/Web3';
import { useProject } from '../../../hooks';
import { renderAsync } from '../../../utils';
import styles from './Home.module.css';

const Project: React.VFC<{ projectId: string; onClick?: () => void }> = ({ projectId, onClick }) => {
  const asyncProject = useProject(projectId);

  return renderAsync(asyncProject, {
    error: (e) => {
      console.log('ERROR loading project', e);
      return null;
    },
    loading: () => <span>{`Loading project id: ${projectId}`}</span>,
    data: (project) => {
      if (!project) return null;
      return <ProjectCard project={project} onClick={onClick} />;
    },
  });
};

const Home: React.VFC = () => {
  const { account, activate } = useWeb3();
  const history = useHistory();

  const handleConnectWallet = React.useCallback(async () => {
    if (account) return;

    try {
      await activate(injectedConntector);
    } catch (e) {
      console.log('Failed to activate wallet', e);
    }
  }, [activate, account]);

  const { data: projects, error, loading } = useUserProjects();

  const handleCreateProjcet = () => {
    history.push('/studio/create');
  };

  if (!account) {
    return (
      <div className={styles.container}>
        <div className={styles.connectWallet}>
          <span className={styles.mainText}>Connect Wallet to use Studio</span>
          <Button type="secondary" label="Connect Wallet" onClick={handleConnectWallet} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3>Studio home</h3>

      {loading && <p>Loading projects</p>}
      {error && <p>{`Failed to load projects: ${error.message}`}</p>}
      <div className={styles.list}>
        {projects?.map((id) => (
          <Project
            projectId={id.toHexString()}
            key={id.toHexString()}
            onClick={() => history.push(`/studio/project/${id.toHexString()}`)}
          />
        ))}
        <NewProjectCard onClick={handleCreateProjcet} />
      </div>
    </div>
  );
};

export default Home;
