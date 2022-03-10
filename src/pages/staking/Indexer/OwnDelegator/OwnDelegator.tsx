// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Spinner, Typography } from '@subql/react-ui';
import * as React from 'react';
import { Table, TableHead, TableBody, TableRow, TableCell } from '@subql/react-ui/dist/components/Table';
import { useTranslation } from 'react-i18next';
import { EraValue } from '../Indexing/Indexing';
import styles from './OwnDelegator.module.css';

interface Props {
  delegations: EraValue[];
}

export const OwnDelegator: React.VFC<Props> = ({ delegations }) => {
  const { t } = useTranslation();
  const tableHeaders = [
    '#',
    t('delegate.delegator').toUpperCase(),
    t('delegate.currentEra').toUpperCase(),
    t('delegate.nextEra').toUpperCase(),
  ];

  return (
    <div className={styles.container}>
      <Table>
        <TableHead>
          <TableRow>
            {tableHeaders.map((header) => (
              <TableCell key={header}>{header}</TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {!delegations && <Spinner />}
          {/* TODO: Style match => antDesign */}
          {delegations?.length > 0 &&
            delegations.map((delegation, idx) => (
              <TableRow key={delegation.delegator}>
                <TableCell>
                  <Typography>{idx + 1}</Typography>
                </TableCell>
                <TableCell>
                  <Typography>{delegation.delegator}</Typography>
                </TableCell>
                <TableCell>
                  <Typography>{delegation.current || 0}</Typography>
                </TableCell>
                <TableCell>
                  <Typography>{delegation.after || 0}</Typography>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
};
