// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useSortedIndexer } from '@hooks';
import { Indexing } from '@pages/indexer/MyStaking/Indexing';
import { Spinner, Typography } from '@subql/components';
import { renderAsync, ROUTES, truncateAddress } from '@utils';
import { t } from 'i18next';
import { useParams } from 'react-router-dom';
import { Copy, CurEra, EmptyList } from '@components';
import { useTranslation } from 'react-i18next';
import styles from './IndexerDetails.module.css';
import ReactJazzicon from 'react-jazzicon';
import { DoDelegate } from '../DoDelegate';
import { useGetIndexerDelegatorsQuery } from '@subql/react-hooks';
import { OwnDelegator } from '@pages/indexer/MyDelegators/OwnDelegator';
import { OwnDeployments } from '@pages/indexer/MyProjects/OwnDeployments';
import { DoUndelegate } from '../DoUndelegate';
import { useWeb3 } from '@containers';
import { BreadcrumbNav } from '@components';

const { DELEGATOR, INDEXERS } = ROUTES;

const NoDelegator: React.FC = () => {
  const { t } = useTranslation();
  return (
    <EmptyList title={t('myDelegators.noDelegatorsTitle')} description={t('myDelegators.noDelegatorsDescription')} />
  );
};

export const AccountHeader: React.FC<{ account: string }> = ({ account }) => {
  const { account: connectedAccount } = useWeb3();
  const canDelegate = connectedAccount !== account;
  return (
    <div className={styles.header}>
      <div className={styles.accountContainer}>
        <ReactJazzicon diameter={70} />
        <div className={styles.account}>
          <Copy value={account}>
            <Typography variant="h5" weight={900}>
              {truncateAddress(account)}
            </Typography>
          </Copy>
        </div>
      </div>
      {canDelegate && (
        <div className={styles.delegateActions}>
          <DoDelegate indexerAddress={account} />
          <DoUndelegate indexerAddress={account} />
        </div>
      )}
    </div>
  );
};

export const IndexerDetails = () => {
  const { id: account } = useParams();
  const sortedIndexer = useSortedIndexer(account || '');
  const indexerDelegators = useGetIndexerDelegatorsQuery({ variables: { id: account ?? '', offset: 0 } });

  return (
    <>
      <div className={styles.navHeader}>
        <BreadcrumbNav
          backLink={`/${DELEGATOR}/${INDEXERS}`}
          backLinkText={t('indexer.indexers')}
          childText={t('delegate.viewProfile')}
        />
        <CurEra />
      </div>
      <AccountHeader account={account ?? ''} />
      {renderAsync(sortedIndexer, {
        loading: () => <Spinner />,
        error: (e) => <Typography>{`Failed to load indexer information: ${e}`}</Typography>,
        data: (data) => (
          <div className={styles.container}>
            <Indexing tableData={data} showDelegated />
          </div>
        ),
      })}
      <div className={styles.container}>
        <div className={styles.delegatorHeader}>
          <Typography variant="h6">{t('indexer.myDelegators')}</Typography>
        </div>
        {renderAsync(indexerDelegators, {
          loading: () => <Spinner />,
          error: (e) => <Typography>{`Failed to load indexer information: ${e}`}</Typography>,
          data: (data) => {
            const totalCount = data?.indexer?.delegations.totalCount || 0;
            if (totalCount <= 0) {
              return <NoDelegator />;
            } else {
              return <OwnDelegator indexer={account ?? ''} />;
            }
          },
        })}
      </div>
      <div className={styles.container}>
        <Typography variant="h6">{t('myProjects.title')}</Typography>
        <OwnDeployments indexer={account ?? ''} />
      </div>
    </>
  );
};
