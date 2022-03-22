// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Typography } from '@subql/react-ui';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ProjectMetadata } from '../../models';
import IPFSImage from '../IPFSImage';
import styles from './OwnDeployment.module.css';

type Props = {
  project: ProjectMetadata;
  deploymentId?: string;
};

const OwnDeployment: React.FC<Props> = ({ project, deploymentId }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.projectInfo}>
      <IPFSImage src={project?.image || '/static/default.project.png'} className={styles.ipfsImage} />
      <div className={styles.projectTextInfo}>
        <Typography variant="large">{project.name}</Typography>
        <Typography variant="small" className={styles.text}>{`${t('projects.deploymentId')}: ${
          deploymentId ?? '-'
        }`}</Typography>
      </div>
    </div>
  );
};

export default OwnDeployment;
