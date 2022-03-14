// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Spinner, Typography } from '@subql/react-ui';
import { Table, TableHead, TableBody, TableRow, TableCell } from '@subql/react-ui/dist/components/Table';
import * as React from 'react';
import styles from './Indexing.module.css';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';
import { OwnDelegator } from '../OwnDelegator';
import { DoStake } from '../DoStake';
import { SetCommissionRate } from '../SetCommissionRate';
import { mapEraValue, parseRawEraValue } from '../../../../hooks/useEraValue';
import { convertStringToNumber, formatEther, mapAsync, mergeAsync, renderAsync } from '../../../../utils';
import { useSortedIndexer } from '../../../../hooks';
import { useWeb3, useEra, useIndexerDelegators } from '../../../../containers';

enum SectionTabs {
  Projects = 'Projects',
  Delegator = 'Delegator',
}

interface Props {
  tableData: ReturnType<typeof useSortedIndexer>;
  indexer: string;
}

export const Indexing: React.VFC<Props> = ({ tableData, indexer }) => {
  const { t } = useTranslation();
  const [curTab, setCurTab] = React.useState<SectionTabs>(SectionTabs.Delegator);
  const { account } = useWeb3();
  const history = useHistory();

  React.useEffect(() => {
    if (!account) {
      history.push('/staking');
    }
  }, [account, history]);

  const tableHeaders = [
    t('indexer.totalStake').toLocaleUpperCase(),
    t('indexer.ownStake').toLocaleUpperCase(),
    t('indexer.commission').toUpperCase(),
    t('indexer.delegated').toUpperCase(),
    t('indexer.capacity').toUpperCase(),
  ];

  const tabList = [SectionTabs.Projects, SectionTabs.Delegator];

  const indexerDelegations = useIndexerDelegators({ id: indexer ?? '' });
  const { currentEra } = useEra();

  const delegation = mapAsync(
    ([indexer, era]) =>
      indexer?.indexer?.delegations.nodes.map((delegation) => ({
        value: mapEraValue(parseRawEraValue(delegation?.amount, era?.index), (v) =>
          convertStringToNumber(formatEther(v ?? 0)),
        ),
        delegator: delegation?.delegatorAddress ?? '',
      })),
    mergeAsync(indexerDelegations, currentEra),
  );

  return (
    <div className={styles.indexing}>
      <div>
        <Typography>Top row of the data represents the data in current era.</Typography>
        <Typography>Data displayed after means the data that will take into effect from next era.</Typography>
      </div>
      <div className={styles.btns}>
        <DoStake />
        <SetCommissionRate />
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
            {renderAsync(tableData, {
              loading: () => <Spinner />,
              error: (e) => <Typography>{`Failed to load indexer information: ${e}`}</Typography>,
              data: (data) => {
                if (!data) return null;
                return (
                  <TableRow>
                    <TableCell>
                      <div>
                        <Typography>{data.totalStake?.current || 0}</Typography>
                        <Typography>{data.totalStake?.after || 0}</Typography>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <Typography>{data.ownStake?.current || 0}</Typography>
                        <Typography>{data.ownStake?.after || 0}</Typography>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <Typography>{data.commission?.current || 0}</Typography>
                        <Typography>{data.commission?.after || 0}</Typography>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <Typography>{data.totalDelegations?.current || 0}</Typography>
                        <Typography>{data.totalDelegations?.after || 0}</Typography>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <Typography>-</Typography>
                        <Typography>-</Typography>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              },
            })}
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
        {curTab === SectionTabs.Delegator &&
          renderAsync(delegation, {
            loading: () => <Spinner />,
            error: (e) => <Typography>{`Failed to load delegations: ${e}`}</Typography>,
            data: (data) => (data ? <OwnDelegator delegations={data} /> : null),
          })}
      </div>
    </div>
  );
};
