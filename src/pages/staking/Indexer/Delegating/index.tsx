// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Spinner, Typography } from '@subql/react-ui';
import * as React from 'react';
import { Table, TableHead, TableBody, TableRow, TableCell } from '@subql/react-ui/dist/components/Table';
import { useTranslation } from 'react-i18next';
import styles from './index.module.css';
import { CurrentEraValue } from '../../../../hooks/useEraValue';
import { DoUndelegate } from '../DoUndelegate';

interface Props {
  delegating: { indexer: string; value: CurrentEraValue<number> }[];
}

export const Delegator: React.VFC<Props> = ({ delegating }) => {
  const { t } = useTranslation();
  const tableHeaders = [
    '#',
    t('indexer.title').toUpperCase(),
    t('delegate.currentEra').toUpperCase(),
    t('delegate.nextEra').toUpperCase(),
    t('indexer.action').toUpperCase(),
  ];

  return (
    <div className={styles.container}>
      <Typography variant="h6" className={styles.header}>
        {`You have total ${delegating.length || 0} delegators`}{' '}
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
          {!delegating && <Spinner />}
          {/* TODO: Style match => antDesign */}
          {delegating?.length > 0 &&
            delegating.map((delegating, idx) => (
              <TableRow key={delegating.indexer}>
                <TableCell>
                  <Typography>{idx + 1}</Typography>
                </TableCell>
                <TableCell>
                  <Typography>{delegating.indexer}</Typography>
                </TableCell>
                <TableCell>
                  <Typography>{delegating.value.current || 0}</Typography>
                </TableCell>
                <TableCell>
                  <Typography>{delegating.value.after || 0}</Typography>
                </TableCell>
                <TableCell>
                  <DoUndelegate indexerAddress={delegating.indexer} />
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Delegator;
