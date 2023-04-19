// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ProjectMetadata } from '../../models';
import { Button } from '@subql/components';
import Detail from '../Detail';
import styles from './ProjectDetail.module.css';

type Props = {
  metadata: ProjectMetadata;
  onEdit?: () => void;
};

const ProjectDetail: React.FC<Props> = ({ metadata, onEdit }) => {
  const { t } = useTranslation();
  return (
    <div className={styles.container}>
      <div className={styles.column}>
        <Detail label={t('projectDetail.description')} value={metadata.description} />
        <div className={styles.left}>
          <div className={styles.column}>
            <Detail
              label={t('projectDetail.websiteUrl')}
              value={metadata.websiteUrl || 'N/A'}
              href={metadata.websiteUrl}
            />
          </div>
          <div className={styles.column}>
            <Detail label={t('projectDetail.sourceUrl')} value={metadata.codeUrl || 'N/A'} href={metadata.codeUrl} />
          </div>
        </div>
      </div>
      <div className={styles.editContainer}>
        {onEdit && <Button type="primary" label={t('projectDetail.button')} onClick={onEdit} className={styles.edit} />}
      </div>
    </div>
  );
};

export default ProjectDetail;
