// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BigNumber } from 'ethers';
import * as React from 'react';
import { useHistory } from 'react-router';
import { Button, NewProjectCard } from '../../../components';
import ProjectCard from '../../../components/ProjectCard';
import { useQueryRegistry, useWeb3 } from '../../../containers';
import { injectedConntector } from '../../../containers/Web3';
import { useAsyncMemo, useProject } from '../../../hooks';
import styles from './Home.module.css';

const Project: React.VFC<{ projectId: string; onClick?: () => void }> = ({ projectId, onClick }) => {
  const project = useProject(projectId);

  if (!project) {
    return null;
  }

  return <ProjectCard project={project} onClick={onClick} />;
};

const Home: React.VFC = () => {
  const { account, activate } = useWeb3();
  const { getUserQueries } = useQueryRegistry();
  const history = useHistory();

  const handleConnectWallet = React.useCallback(async () => {
    if (account) return;

    try {
      await activate(injectedConntector);
    } catch (e) {
      console.log('Failed to activate wallet', e);
    }
  }, [activate, account]);

  const projects = useAsyncMemo<BigNumber[]>(async () => {
    if (!account) return [];

    return getUserQueries(account);
  }, [account, getUserQueries]);

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
