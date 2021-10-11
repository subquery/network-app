// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { ProjectDetails } from '../../models';
import { genesisHashToName } from '../../utils';
import Detail from '../Detail';
import styles from './ProjectDetail.module.css';

type Props = {
  project: ProjectDetails;
};

const ProjectDetail: React.VFC<Props> = ({ project }) => {
  const network = React.useMemo(
    () => genesisHashToName(project.manifest.asV0_2_0.network.genesisHash),
    [project.manifest],
  );

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
        <Detail label="Source" value={project.manifest.repository || 'N/A'} href={project.manifest.repository} />
        <Detail label="Deployment" value={project.deployment} href={`https://ipfs.io/ipfs/${project.deployment}`} />
      </div>
    </div>
  );
};

export default ProjectDetail;
