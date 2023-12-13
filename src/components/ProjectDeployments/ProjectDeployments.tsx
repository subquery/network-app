// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Markdown } from '@subql/components';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import { NewDeployment } from '../../models';
import { Table, TableBody, TableCell, TableHead, TableRow } from '../Table';
import { Copy } from '..';
import styles from './ProjectDeployments.module.less';

dayjs.extend(utc);

type Deployment = NewDeployment & { createdAt?: Date };

type Props = {
  deployments: Deployment[];
  projectId: string;
};

const ProjectDeployments: React.FC<Props> = ({ deployments, projectId }) => {
  const { t } = useTranslation();

  return (
    <>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>{t('deployments.header1')}</TableCell>
            <TableCell>{t('deployments.header2')}</TableCell>
            <TableCell>{t('deployments.header3')}</TableCell>
            <TableCell>{t('deployments.header4')}</TableCell>
            {/* <TableCell>{t('general.action')}</TableCell> */}
          </TableRow>
        </TableHead>
        <TableBody>
          {deployments.map((deployment, index) => (
            <TableRow>
              <TableCell>
                <p className={styles.value}>{deployment.version}</p>
              </TableCell>
              <TableCell>
                <div className={styles.deploymentId}>
                  <p className={styles.value}>{deployment.deploymentId}</p>
                  <Copy value={deployment.deploymentId} className={styles.copy} />
                </div>
              </TableCell>
              <TableCell>
                <div className={styles.descriptionMarkdown}>
                  <Markdown.Preview>{deployment.description}</Markdown.Preview>
                </div>
              </TableCell>
              <TableCell>
                <p className={styles.value}>
                  {deployment.createdAt ? dayjs(deployment.createdAt).utc(true).fromNow() : 'N/A'}
                </p>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};

export default ProjectDeployments;
