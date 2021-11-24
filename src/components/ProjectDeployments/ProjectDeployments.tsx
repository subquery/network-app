// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import styles from './ProjectDeployments.module.css';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { NewDeployment } from '../../models';
import moment from 'moment';

type Deployment = NewDeployment & { createdAt?: Date };

type Props = {
  deployments: Deployment[];
};

const Row: React.FC<{ deployment: Deployment }> = ({ deployment }) => {
  const createdAt = React.useMemo(
    () => (deployment.createdAt ? moment(deployment.createdAt).fromNow() : 'N/A'),
    [deployment],
  );
  return (
    <TableRow>
      <TableCell>{deployment.version}</TableCell>
      <TableCell>{deployment.deploymentId}</TableCell>
      <TableCell>{deployment.description}</TableCell>
      <TableCell>
        <span className={styles.createdAt}>{createdAt}</span>
      </TableCell>
    </TableRow>
  );
};

const ProjectDeployments: React.FC<Props> = ({ deployments }) => {
  // TODO extract to common table to share with indexer details
  return (
    <TableContainer>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Version</TableCell>
            <TableCell>Deployment ID</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Created Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {deployments.map((indexer, index) => (
            <Row deployment={indexer} key={index} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ProjectDeployments;
