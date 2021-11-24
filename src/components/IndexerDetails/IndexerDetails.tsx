// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import styles from './IndexerDetails.module.css';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { GetDeploymentIndexers_indexers_nodes as DeploymentIndexer } from '../../__generated__/GetDeploymentIndexers';
import moment from 'moment';

type Props = {
  indexers: readonly DeploymentIndexer[];
};

const Row: React.VFC<{ indexer: DeploymentIndexer }> = ({ indexer }) => {
  const updatedAt = React.useMemo(() => moment(indexer.timestamp).fromNow(), [indexer.timestamp]);
  return (
    <TableRow>
      <TableCell>{indexer.indexer}</TableCell>
      <TableCell>{indexer.blockHeight.toString()}</TableCell>
      <TableCell>{indexer.status}</TableCell>
      <TableCell>{updatedAt}</TableCell>
    </TableRow>
  );
};

const IndexerDetails: React.FC<Props> = ({ indexers }) => {
  // TODO extract to common table to share with deployments
  return (
    <TableContainer>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Address</TableCell>
            <TableCell>Block Height</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Updated</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {indexers.map((indexer, index) => (
            <Row indexer={indexer} key={index} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default IndexerDetails;
