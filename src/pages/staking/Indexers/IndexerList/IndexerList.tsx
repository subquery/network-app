// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Typography } from '@subql/react-ui';
import * as React from 'react';
import { Table, TableHead, TableBody, TableRow, TableCell } from '@subql/react-ui/dist/components/Table';
import { useTranslation } from 'react-i18next';
import { convertBigNumberToNumber, formatEther, toPercentage } from '../../../../utils';
import { mapEraValue, parseRawEraValue, RawEraValue } from '../../../../hooks/useEraValue';
import { GetIndexers_indexers_nodes as Indexer } from '../../../../__generated__/GetIndexers';
import { useEra, useWeb3 } from '../../../../containers';
import styles from './IndexerList.module.css';
import { DoDelegate } from '../DoDelegate';
// import { Table, Switch } from 'antd';

interface props {
  indexers: Indexer[];
}

export const IndexerList: React.VFC<props> = ({ indexers }) => {
  const { currentEra } = useEra();
  const { account } = useWeb3();
  const { t } = useTranslation();

  const sortedIndexerList = indexers.map((indexer) => {
    const convertedCommission = parseRawEraValue(indexer.commission as RawEraValue, currentEra.data?.index);
    const convertedTotalStake = parseRawEraValue(indexer.totalStake as RawEraValue, currentEra.data?.index);

    const sortedCommission = mapEraValue(convertedCommission, (v) => toPercentage(convertBigNumberToNumber(v ?? 0)));
    const sortedTotalStake = mapEraValue(convertedTotalStake, (v) => formatEther(v ?? 0));

    return { ...indexer, commission: sortedCommission, totalStake: sortedTotalStake };
  });

  const orderedIndexerList = sortedIndexerList.sort((indexerA) => (indexerA.id === account ? -1 : 0));
  console.log('orderedIndexerList', orderedIndexerList);

  const tableHeaders = [
    '#',
    'indexer'.toUpperCase(),
    'current total stake'.toUpperCase(),
    'next total stake'.toUpperCase(),
    'current commission'.toUpperCase(),
    'next commission'.toUpperCase(),
    'action'.toUpperCase(),
  ];

  return (
    <div className={styles.container}>
      <Typography variant="h6" className={styles.title}>
        There are {indexers.length || 0} indexer(s)
      </Typography>

      <Table>
        <TableHead>
          <TableRow>
            {tableHeaders.map((header) => (
              <TableCell key={header}>{header}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {/* TODO: Style match => antDesign */}
          {sortedIndexerList?.length > 0 &&
            sortedIndexerList.map((indexer, idx) => (
              <TableRow key={indexer.id}>
                <TableCell>
                  <Typography>{idx + 1}</Typography>
                </TableCell>
                <TableCell>
                  <Typography>{`${indexer.id === account ? 'You' : indexer.id}`}</Typography>
                </TableCell>
                <TableCell>
                  <Typography>{indexer.totalStake.current || 0}</Typography>
                </TableCell>
                <TableCell>
                  <Typography>{indexer.totalStake.after || 0}</Typography>
                </TableCell>
                <TableCell>
                  <Typography>{indexer.commission.current || 0}</Typography>
                </TableCell>
                <TableCell>
                  <Typography>{indexer.commission.after || 0}</Typography>
                </TableCell>
                <TableCell>
                  <DoDelegate indexerAddress={indexer.id} />
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
};
