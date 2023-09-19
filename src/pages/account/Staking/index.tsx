// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useMemo } from 'react';
import { useWeb3 } from '@containers';
import { useSortedIndexer } from '@hooks';
import { StakeAndDelegationLineChart } from '@pages/dashboard/components/StakeAndDelegationLineChart/StakeAndDelegationLineChart';
import { NoDelegator } from '@pages/delegator/IndexerDetails/IndexerDetails';
import { OwnDelegator } from '@pages/indexer/MyDelegators/OwnDelegator';
import { Spinner, Typography } from '@subql/components';
import { renderAsync, useGetIndexerDelegatorsQuery } from '@subql/react-hooks';
import { formatNumber, parseError, TOKEN } from '@utils';
import { t } from 'i18next';

import Breakdown from './Breakdown';
import styles from './index.module.less';

const Staking: FC = () => {
  const { account } = useWeb3();
  const indexerDelegators = useGetIndexerDelegatorsQuery({ variables: { id: account ?? '', offset: 0 } });
  const sortedIndexer = useSortedIndexer(account || '');

  const totalCount = useMemo(() => {
    return indexerDelegators.data?.indexer?.delegations.totalCount || 0;
  }, [indexerDelegators]);

  const totalStaked = useMemo(() => {
    return sortedIndexer.data?.totalStake;
  }, [sortedIndexer]);

  return renderAsync(indexerDelegators, {
    loading: () => <Spinner></Spinner>,
    error: (e) => <Typography>{parseError(e)}</Typography>,
    data: () => {
      return (
        <div className={styles.staking}>
          <div className={styles.stakingBreakdown}>
            <Typography variant="large" weight={600}>
              Breakdown
            </Typography>

            <div className="flex" style={{ marginTop: 8, justifyContent: 'center' }}>
              <Breakdown
                data={[
                  {
                    value: totalStaked?.current || 0,
                  },
                ]}
              ></Breakdown>

              <div style={{ marginLeft: 24 }}>
                <div className="col-flex">
                  <Typography>Currently Staked to your Indexer</Typography>

                  <div style={{ display: 'flex', alignItems: 'baseline', fontSize: 16, margin: '8px 0' }}>
                    <Typography variant="h5" weight={500} style={{ color: 'var(--sq-blue600)', marginRight: 8 }}>
                      {formatNumber(totalStaked?.current || '0')}
                    </Typography>
                    {TOKEN}
                  </div>

                  <Typography variant="small" type="secondary">
                    {formatNumber(totalStaked?.after || '0')} {TOKEN}
                  </Typography>
                </div>

                {/* <div className="col-flex" style={{ marginTop: 24 }}>
                  <Typography>Currently Delegated to other Indexers</Typography>

                  <div style={{ display: 'flex', alignItems: 'baseline', fontSize: 16, margin: '8px 0' }}>
                    <Typography variant="h5" weight={500} style={{ color: 'var(--sq-blue600)', marginRight: 8 }}>
                      {formatNumber(123123)}
                    </Typography>
                    {TOKEN}
                  </div>

                  <Typography variant="small" type="secondary">
                    {formatNumber(123123)} {TOKEN}
                  </Typography>
                </div> */}
              </div>
            </div>
          </div>
          {account && (
            <StakeAndDelegationLineChart
              account={account}
              title="Total Staked Tokens"
              dataDimensionsName={['Staked to your Indexer', 'Delegated to other indexers']}
            ></StakeAndDelegationLineChart>
          )}

          <div className={styles.myDelegators}>
            <div className={styles.delegatorHeader}>
              <Typography variant="h5">{t('indexer.myDelegators')}</Typography>
            </div>
            {totalCount <= 0 && <NoDelegator />}
            {totalCount > 0 && <OwnDelegator indexer={account ?? ''} />}
          </div>
        </div>
      );
    },
  });
};
export default Staking;
