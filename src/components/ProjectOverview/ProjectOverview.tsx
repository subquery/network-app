// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import moment from 'moment';
import * as React from 'react';
import { ProjectMetadata } from '../../models';
import Detail from '../Detail';

import styles from './ProjectOverview.module.css';

type Props = {
  metadata: ProjectMetadata;
  deploymentId: string;
  createdAt: Date;
  updatedAt: Date;
};

const ProjectOverview: React.VFC<Props> = ({ metadata, deploymentId, createdAt, updatedAt }) => {
  const createdAtStr = React.useMemo(() => moment(createdAt).fromNow(), [createdAt]);
  const updatedAtStr = React.useMemo(() => moment(updatedAt).fromNow(), [updatedAt]);
  return (
    <div className={styles.container}>
      <div className={styles.column}>
        <Detail label="Description" value={metadata.description} />
        <div className={styles.left}>
          <div className={styles.column}>
            <Detail label="Created" value={createdAtStr} />
          </div>
          <div className={styles.column}>
            <Detail label="Updated" value={updatedAtStr} />
          </div>
        </div>
      </div>

      <div className={styles.column}>
        <Detail label="Deployment ID" value={deploymentId || 'N/A'} href={metadata.websiteUrl} />
        <Detail label="Website URL" value={metadata.websiteUrl || 'N/A'} href={metadata.websiteUrl} />
        <Detail label="Source code URL" value={metadata.codeUrl || 'N/A'} href={metadata.codeUrl} />
      </div>
    </div>
  );
};

export default ProjectOverview;
