// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { DeploymentIndexer } from '../../containers/QueryRegistryProject';
import styles from './IndexerDetails.module.css';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

type Props = {
  indexers: DeploymentIndexer[];
};

const IndexerDetails: React.FC<Props> = ({ indexers }) => {
  const row = (indexer: DeploymentIndexer, key: string | number) => {
    return (
      <TableRow key={key}>
        <TableCell>{indexer.indexer}</TableCell>
        <TableCell>{indexer.blockHeight.toString()}</TableCell>
        <TableCell>{indexer.status}</TableCell>
        <TableCell>{indexer.updatedAt.toLocaleString()}</TableCell>
      </TableRow>
    );
  };

  // TODO extract to common table to share with deployments
  return (
    <TableContainer>
      <Table aria-label="simple table">
        <TableHead>
          <TableCell>Address</TableCell>
          <TableCell>Block Height</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Updated</TableCell>
        </TableHead>
        <TableBody>{indexers.map((indexer, index) => row(indexer, index))}</TableBody>
      </Table>
    </TableContainer>
  );
};

export default IndexerDetails;
