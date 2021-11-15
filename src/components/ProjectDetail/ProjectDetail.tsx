// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { ProjectMetadata } from '../../models';
import Button from '../Button';
import Detail from '../Detail';

import styles from './ProjectDetail.module.css';

type Props = {
  metadata: ProjectMetadata;
  onEdit?: () => void;
};

const ProjectDetail: React.VFC<Props> = ({ metadata, onEdit }) => {
  return (
    <div className={styles.container}>
      <div className={styles.column}>
        <Detail label="Description" value={metadata.description} />
        <div className={styles.left}>
          <div className={styles.column}>
            <Detail label="Website URL" value={metadata.websiteUrl || 'N/A'} href={metadata.websiteUrl} />
          </div>
          <div className={styles.column}>
            <Detail label="Source code URL" value={metadata.codeUrl || 'N/A'} href={metadata.codeUrl} />
          </div>
        </div>
      </div>
      <div className={styles.editContainer}>
        {onEdit && <Button type="primary" label="Edit" onClick={onEdit} className={styles.edit} />}
      </div>
    </div>
  );
};

export default ProjectDetail;
