// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import moment from 'moment';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ProjectMetadata } from '../../models';
import Detail from '../Detail';

import styles from './ProjectOverview.module.css';

type Props = {
  metadata: ProjectMetadata;
  deploymentDescription?: string;
  createdAt: Date;
  updatedAt: Date;
};

const ExternalLink: React.VFC<{ link?: string; icon: 'globe' | 'github' }> = ({ link, icon }) => {
  return (
    <div className={styles.linkContainer}>
      <i className={`bi-${icon}`} role="img" aria-label={icon} />
      <a className={styles.link} href={link} target="_blank" rel="noreferrer">
        {link || 'N/A'}
      </a>
    </div>
  );
};

const ProjectOverview: React.VFC<Props> = ({ metadata, deploymentDescription, createdAt, updatedAt }) => {
  const { t } = useTranslation();
  const createdAtStr = React.useMemo(() => moment(createdAt).utc(true).fromNow(), [createdAt]);
  const updatedAtStr = React.useMemo(() => moment(updatedAt).utc(true).fromNow(), [updatedAt]);

  return (
    <div className={styles.container}>
      <div className={styles.column}>
        <p className={styles.description}>{metadata.description}</p>
        <ExternalLink icon="globe" link={metadata.websiteUrl} />
        <ExternalLink icon="github" link={metadata.codeUrl} />
        <div className={styles.left}>
          <Detail label={t('projectOverview.createdAt')} value={createdAtStr} className={styles.column} />
          <Detail label={t('projectOverview.updatedAt')} value={updatedAtStr} className={styles.column} />
        </div>
      </div>

      <div className={styles.column}>
        <Detail label={t('projectOverview.deploymentDescription')} value={deploymentDescription || 'N/A'} />
      </div>
    </div>
  );
};

export default ProjectOverview;
