// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
// import styles from './ProjectDeployments.module.css';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { NewDeployment } from '../../models';

type Deployment = NewDeployment & { createdAt: Date };

type Props = {
  deployments: Deployment[];
};

const ProjectDeployments: React.FC<Props> = ({ deployments }) => {
  const row = (deployment: Deployment, key: string | number) => {
    return (
      <TableRow key={key}>
        <TableCell>{deployment.version}</TableCell>
        <TableCell>{deployment.deploymentId}</TableCell>
        <TableCell>{deployment.description}</TableCell>
        <TableCell>{deployment.createdAt.toLocaleString()}</TableCell>
      </TableRow>
    );
  };

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
        <TableBody>{deployments.map((indexer, index) => row(indexer, index))}</TableBody>
      </Table>
    </TableContainer>
  );
};

export default ProjectDeployments;
