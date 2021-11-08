// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { ProjectDetails } from '../../models';
import { genesisHashToName } from '../../utils';
import Button from '../Button';
import Detail from '../Detail';

import styles from './ProjectDetail.module.css';

type Props = {
  project: ProjectDetails;
  onNewDeployment?: () => void;
};

const ProjectDetail: React.VFC<Props> = ({ project, onNewDeployment }) => {
  const network = React.useMemo(
    () => project.deployment && genesisHashToName(project.deployment.manifest.asV0_2_0.network.genesisHash),
    [project.deployment?.manifest],
  );

  const renderNoDeployments = () => {
    return (
      <div>
        <div>
          <span>Deploy to SubQuery Network</span>
          <span>Something something something</span>
        </div>
        <Button label="Deploy" onClick={onNewDeployment} type="primary" />
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.column}>
        <div className={styles.left}>
          {/* TODO map*/}
          <Detail className={styles.leftDetail} label="Network" value={network} />
          <Detail className={styles.leftDetail} label="Network" value={network} />
        </div>

        <p className={styles.description}>{project.metadata.description}</p>
      </div>
      <div className={styles.column}>
        <Detail label="Website" value={project.metadata.websiteUrl || 'N/A'} href={project.metadata.websiteUrl} />
        {project.deployment ? (
          <>
            <Detail
              label="Source"
              value={project.deployment?.manifest.repository || 'N/A'}
              href={project.deployment?.manifest.repository}
            />
            <Detail
              label="Deployment"
              value={project.deployment.id}
              href={`https://ipfs.io/ipfs/${project.deployment.id}`}
            />
          </>
        ) : (
          renderNoDeployments()
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;
