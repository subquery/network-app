// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Typography } from '@subql/react-ui';
import * as React from 'react';
import { Table, TableHead, TableBody, TableRow, TableCell } from '@subql/react-ui/dist/components/Table';
import { useTranslation } from 'react-i18next';
import { convertBigNumberToNumber, formatEther, toPercentage } from '../../../../utils';
import { convertRawEraValue, RawEraValue } from '../../../../hooks/useEraValue';
import { GetIndexers_indexers_nodes as Indexer } from '../../../../__generated__/GetIndexers';
import { useEra, useWeb3 } from '../../../../containers';
import styles from './IndexerList.module.css';

interface props {
  indexers: Indexer[];
}

export const IndexerList: React.VFC<props> = ({ indexers }) => {
  const { currentEra } = useEra();
  const { account } = useWeb3();
  const { t } = useTranslation();

  const sortedIndexerList = indexers.map((indexer) => {
    const convertedCommission = convertRawEraValue(indexer.commission as RawEraValue);
    const convertedTotalStake = convertRawEraValue(indexer.totalStake as RawEraValue);

    const formattedCurCommission = convertBigNumberToNumber(convertedCommission.value);
    const formattedAfterCommission = convertBigNumberToNumber(convertedCommission.valueAfter);
    const sortedCommission =
      convertedCommission.era < (currentEra.data?.index || 0)
        ? { value: formattedAfterCommission, valueAfter: 0 }
        : { value: formattedCurCommission, valueAfter: formattedAfterCommission };

    const formattedCurTotalStake = formatEther(convertedTotalStake.value);
    const formattedAfterTotalStake = formatEther(convertedTotalStake.valueAfter);
    const sortedTotalStake =
      convertedTotalStake.era < (currentEra.data?.index || 0)
        ? { value: formattedAfterTotalStake, valueAfter: 0 }
        : { value: formattedCurTotalStake, valueAfter: formattedAfterTotalStake };

    return { ...indexer, commission: sortedCommission, totalStake: sortedTotalStake };
  });

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
                  <Typography>{indexer.totalStake.value || 0}</Typography>
                </TableCell>
                <TableCell>
                  <Typography>{indexer.totalStake.value || 0}</Typography>
                </TableCell>
                <TableCell>
                  <Typography>{toPercentage(indexer.commission.value || 0)}</Typography>
                </TableCell>
                <TableCell>
                  <Typography>{toPercentage(indexer.commission.value || 0)}</Typography>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
};
