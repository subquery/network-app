// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useSortedIndexer } from '@hooks';
import { Indexing } from '@pages/indexer/MyStaking/Indexing';
import { Spinner, Typography } from '@subql/components';
import { formatEther, mapAsync, mergeAsync, notEmpty, renderAsync, ROUTES, truncateAddress } from '@utils';
import { t } from 'i18next';
import { useParams } from 'react-router-dom';
import { Copy, CurEra, EmptyList } from '@components';
import { useTranslation } from 'react-i18next';
import styles from './IndexerDetails.module.css';
import ReactJazzicon from 'react-jazzicon';
import { DoDelegate } from '../DoDelegate';
import {
  useGetFilteredDelegationsQuery,
  useGetIndexerDelegatorsQuery,
  useGetFilteredDelegationQuery,
} from '@subql/react-hooks';
import { OwnDelegator } from '@pages/indexer/MyDelegators/OwnDelegator';
import { OwnDeployments } from '@pages/indexer/MyProjects/OwnDeployments';
import { DoUndelegate } from '../DoUndelegate';
import { useEra, useWeb3 } from '@containers';
import { BreadcrumbNav } from '@components';
import { SUB_DELEGATIONS } from '@containers/IndexerRegistryProjectSub';
import { mapEraValue, parseRawEraValue, RawEraValue } from '@hooks/useEraValue';
import { parseEther } from 'ethers/lib/utils';

const { DELEGATOR, INDEXERS } = ROUTES;

const NoDelegator: React.FC = () => {
  const { t } = useTranslation();
  return (
    <EmptyList title={t('myDelegators.noDelegatorsTitle')} description={t('myDelegators.noDelegatorsDescription')} />
  );
};

export const AccountHeader: React.FC<{ account: string }> = ({ account }) => {
  const { account: connectedAccount } = useWeb3();
  const { currentEra } = useEra();
  const canDelegate = connectedAccount !== account;
  const filterParams = { delegator: connectedAccount ?? '', indexer: account ?? '', offset: 0 };
  const delegations = useGetFilteredDelegationQuery({
    variables: filterParams,
  });

  delegations.subscribeToMore({
    document: SUB_DELEGATIONS,
    variables: filterParams,
    updateQuery: (prev, { subscriptionData }) => {
      if (subscriptionData.data) {
        delegations.refetch();
      }
      return prev;
    },
  });

  const delegationList = mapAsync(
    ([delegations, era]) =>
      delegations?.delegations?.nodes
        .filter(notEmpty)
        .map((delegation) => ({
          value: mapEraValue(parseRawEraValue(delegation?.amount as RawEraValue, era?.index), (v) =>
            formatEther(v ?? 0),
          ),
        }))
        .filter(
          (delegation) =>
            parseEther(delegation.value.current).gt('0') || parseEther(delegation?.value?.after ?? '0').gt('0'),
        ),
    mergeAsync(delegations, currentEra),
  );

  const nextEraValue = delegationList.data?.find((delegation) => delegation.value?.after)?.value.after;

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
          <DoUndelegate indexerAddress={account} availableBalance={nextEraValue} variant={'button'} />
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
