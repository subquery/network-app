// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { GetDeploymentIndexers_deploymentIndexers_nodes as DeploymentIndexer } from '../../__generated__/GetDeploymentIndexers';
import Row from './Row';
import { useTranslation } from 'react-i18next';
import { Table, TableHead, TableBody, TableRow, TableCell } from '../Table';

type Props = {
  indexers: readonly DeploymentIndexer[];
  deploymentId?: string;
  startBlock?: number;
};

const IndexerDetails: React.FC<Props> = ({ indexers, startBlock, deploymentId }) => {
  const { t } = useTranslation();

  return (
    <Table aria-label="simple table">
      <TableHead>
        <TableRow>
          <TableCell>{t('indexers.head.indexers')}</TableCell>
          <TableCell>{t('indexers.head.progress')}</TableCell>
          <TableCell>{t('indexers.head.status')}</TableCell>
          <TableCell>{t('indexers.head.plans')}</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {indexers.map((indexer, index) => (
          <Row indexer={indexer} key={index} startBlock={startBlock} deploymentId={deploymentId} />
        ))}
      </TableBody>
    </Table>
  );
};

export default IndexerDetails;
