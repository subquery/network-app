// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Spinner, Typography } from '@subql/react-ui';
import * as React from 'react';
import { Table, TableHead, TableBody, TableRow, TableCell } from '@subql/react-ui/dist/components/Table';
import { useTranslation } from 'react-i18next';
import styles from './index.module.css';
import { DoUndelegate } from '../DoUndelegate';
import { mapEraValue, parseRawEraValue, RawEraValue } from '../../../../hooks/useEraValue';
import { useDelegations, useEra } from '../../../../containers';
import { convertStringToNumber, formatEther, mapAsync, mergeAsync, notEmpty, renderAsync } from '../../../../utils';

interface Props {
  delegator: string;
}

export const Delegator: React.VFC<Props> = ({ delegator }) => {
  const { t } = useTranslation();
  const delegations = useDelegations({ delegator });
  const { currentEra } = useEra();

  const delegationList = mapAsync(
    ([delegations, era]) =>
      delegations?.delegations?.nodes.filter(notEmpty).map((delegation) => ({
        value: mapEraValue(parseRawEraValue(delegation?.amount as RawEraValue, era?.index), (v) =>
          convertStringToNumber(formatEther(v ?? 0)),
        ),
        indexer: delegation.indexerAddress,
      })),
    mergeAsync(delegations, currentEra),
  );

  console.log('delegationList', delegationList);

  const tableHeaders = [
    '#',
    t('indexer.title').toUpperCase(),
    t('delegate.currentEra').toUpperCase(),
    t('delegate.nextEra').toUpperCase(),
    t('indexer.action').toUpperCase(),
  ];

  return (
    <div className={styles.container}>
      {renderAsync(delegationList, {
        loading: () => <Spinner />,
        error: (e) => <Typography>{`Failed to load delegations: ${e.message}`}</Typography>,
        data: (data) => {
          console.log('data', data);
          if (!data || data.length === 0) return <Typography variant="h5">{t('delegate.noDelegating')}</Typography>;
          return (
            <>
              <Typography variant="h6" className={styles.header}>
                {`You have total ${delegations.data?.delegations?.totalCount || 0} delegation(s)`}
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
                  {data.map((delegating, idx) => (
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
            </>
          );
        },
      })}

      {/* TODO paging delegations */}
    </div>
  );
};

export default Delegator;
