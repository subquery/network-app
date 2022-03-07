// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Button, Spinner, Typography } from '@subql/react-ui';
import { Table, TableHead, TableBody, TableRow, TableCell } from '@subql/react-ui/dist/components/Table';
import * as React from 'react';
import styles from './Indexing.module.css';
import { useTranslation } from 'react-i18next';
import Delegator from '../Delegator';
// import { SetCommission } from '../SetCommission';
import { useWeb3 } from '../../../../containers';
// import OwnDelegation from '../OwnDelegation';

enum SectionTabs {
  Projects = 'Projects',
  Delegator = 'Delegator',
}

export interface EraValue {
  value?: string | number;
  valueAfter?: string | number;
  delegator?: string;
  indexer?: string;
}

interface Props {
  tableData: {
    totalStake: EraValue;
    ownStake: EraValue;
    commission: EraValue;
    totalDelegations: EraValue;
  };
  delegations: EraValue[];
}

export const Indexing: React.VFC<Props> = ({ tableData, delegations }) => {
  const { account } = useWeb3();
  const [curTab, setCurTab] = React.useState<SectionTabs>(SectionTabs.Projects);
  const { t } = useTranslation();

  const tableHeaders = [
    t('indexer.totalStake').toLocaleUpperCase(),
    'own stake',
    t('indexer.commission').toUpperCase(),
    t('indexer.delegated').toUpperCase(),
    t('indexer.capacity').toUpperCase(),
  ];

  const tabList = [SectionTabs.Projects, SectionTabs.Delegator];

  return (
    <div className={styles.indexing}>
      <div>
        <Typography>Top row of the data represents the data in current era.</Typography>
        <Typography>Data displayed after means the data that will take into effect from next era.</Typography>
      </div>
      <div className={styles.btns}>
        <Button
          label="Stake"
          onClick={() => console.log('Stake')}
          className={styles.btn}
          size="medium"
          type="secondary"
        />
        <Button
          label="UnStake"
          onClick={() => console.log('UnStake')}
          className={styles.btn}
          size="medium"
          type="secondary"
        />
        <Button
          label="Change commission rate"
          onClick={() => console.log('Change commission rate')}
          className={styles.btn}
          size="medium"
          type="secondary"
        />
        {/* <SetCommission indexerAddress={account || ''} />
        <OwnDelegation indexerAddress={account || ''} /> */}
      </div>

      <div>
        <Table>
          <TableHead>
            <TableRow>
              {tableHeaders.map((header) => (
                <TableCell key={header}>{header}</TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {!tableData && <Spinner />}
            {tableData && (
              <TableRow>
                <TableCell>
                  <div>
                    <Typography>{tableData.totalStake?.value || 0}</Typography>
                    <Typography>{tableData.totalStake?.valueAfter || 0}</Typography>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <Typography>{tableData.ownStake?.value || 0}</Typography>
                    <Typography>{tableData.ownStake?.valueAfter || 0}</Typography>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <Typography>{tableData.commission?.value || 0}</Typography>
                    <Typography>{tableData.commission?.valueAfter || 0}</Typography>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <Typography>{tableData.totalDelegations?.value || 0}</Typography>
                    <Typography>{tableData.totalDelegations?.valueAfter || 0}</Typography>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <Typography>-</Typography>
                    <Typography>-</Typography>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* TODO Button component */}
      <div>
        <div className={styles.tabList}>
          {tabList.map((tab) => (
            <div key={tab} className={styles.tab} onClick={() => setCurTab(tab)}>
              <Typography className={`${styles.tabText} ${styles.grayText}`}>{tab}</Typography>
              {curTab === tab && <div className={styles.line} />}
            </div>
          ))}
        </div>

        {curTab === SectionTabs.Projects && <div>Projects</div>}
        {curTab === SectionTabs.Delegator && <Delegator delegations={delegations} />}
      </div>
    </div>
  );
};
