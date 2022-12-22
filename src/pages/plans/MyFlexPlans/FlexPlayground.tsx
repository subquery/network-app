// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router';
import { Table } from 'antd';
import { DeploymentMeta, TableText } from '../../../components';
import styles from './FlexPlayground.module.css';
import { GetOngoingFlexPlan_stateChannels_nodes as ConsumerFlexPlan } from '../../../__generated__/registry/GetOngoingFlexPlan';

import {
  formatEther,
  getEncryptStorage,
  parseError,
  removeStorage,
  setEncryptStorage,
  TOKEN,
  wrapProxyEndpoint,
} from '../../../utils';
import { POST } from '../../../utils/fetch';
import { defaultQuery } from '../../../components/GraphQLPlayground/GraphQLPlayground';
import { useWeb3 } from '../../../containers';
import { NotificationType, openNotificationWithIcon } from '../../../components/TransactionModal/TransactionModal';
import { Spinner } from '@subql/react-ui';
import { GraphQLQuery } from '../Playground/GraphQLQuery';
import { RequestToken } from '../Playground/RequestToken';
import { PlaygroundHeader } from '../Playground/Playground';
import { TableProps } from 'antd';
import moment from 'moment';
import { ConnectedIndexer } from '../../../components/IndexerDetails/IndexerName';
import { ONGOING_PLANS } from './MyFlexPlans';

const columns: TableProps<ConsumerFlexPlan>['columns'] = [
  {
    dataIndex: 'indexer',
    title: 'INDEXER',
    key: 'indexer',
    render: (indexer: ConsumerFlexPlan['indexer']) => <ConnectedIndexer id={indexer} />,
  },
  {
    dataIndex: 'price',
    title: 'PRICE',
    key: 'price',
    render: (price: ConsumerFlexPlan['price']) => <TableText content={`${formatEther(price)} ${TOKEN}`} />,
  },
  {
    dataIndex: 'validity',
    title: 'VALIDITY',
    key: 'validity',
    render: (_, fp: ConsumerFlexPlan) => {
      return <TableText content={moment(fp.expiredAt).utc(true).fromNow()} />;
    },
  },
  {
    dataIndex: 'spent',
    title: 'SPENT',
    key: 'spent',
    render: (spent: ConsumerFlexPlan['spent']) => <TableText content={`${formatEther(spent)} ${TOKEN}`} />,
  },
  {
    dataIndex: 'channelState',
    title: 'CHANNEL STATE',
    key: 'channelState',
    render: (price: ConsumerFlexPlan['status']) => <TableText content={`${formatEther(price)} ${TOKEN}`} />,
  },
];

export const FlexPlayground: React.VFC = () => {
  const { t } = useTranslation();
  const { account } = useWeb3();
  const location = useLocation();
  const history = useHistory();
  const [isCheckingAuth, setIsCheckingAuth] = React.useState<boolean>();
  const [queryable, setQueryable] = React.useState<boolean>();

  const flexPlan = location?.state as ConsumerFlexPlan;
  const TOKEN_STORAGE_KEY = `${flexPlan?.id}/${account}`;
  const [sessionToken, setSessionToken] = React.useState<string>(getEncryptStorage(TOKEN_STORAGE_KEY));

  const { queryUrl, requestTokenUrl } = React.useMemo(() => {
    return {
      queryUrl: wrapProxyEndpoint(
        `${process.env.REACT_APP_CONSUMER_HOST_ENDPOINT}/query/${flexPlan?.deployment?.id}?apikey=${sessionToken}`,
        flexPlan?.indexer,
      ),
      requestTokenUrl: wrapProxyEndpoint(`${process.env.REACT_APP_CONSUMER_HOST_ENDPOINT}/token`, flexPlan?.indexer),
    };
  }, [flexPlan?.deployment, flexPlan?.indexer, sessionToken]);

  //TODO: send request like with purchasePlan
  //TODO: better handling when it can't ping endpoint

  /**
   * Query Graphql
   *
   * 1. 401 => require auth for further query
   * 2. 200 => queryable
   * 3. 400 => exceed daily limit
   * 4. otherStatusCode => return to serviceAgreementTable
   *
   */
  React.useEffect(() => {
    const initialQuery = async () => {
      setIsCheckingAuth(true);
      if (!queryUrl) return;

      const headers = sessionToken ? { Authorization: `Bearer ${sessionToken}` } : undefined;
      const { response, error } = await POST({ endpoint: queryUrl, requestBody: defaultQuery, headers });
      if (response?.status === 200) {
        setQueryable(true);
      }

      if (response?.status === 401) {
        setQueryable(false);
        removeStorage(TOKEN_STORAGE_KEY);
      }

      if ((response?.status !== 401 && response?.status !== 200) || error) {
        setQueryable(undefined);
        removeStorage(TOKEN_STORAGE_KEY);

        const { error: resError } = await response?.json();
        const sortedError = resError ? parseError(resError) : error?.message ?? t('serviceAgreements.playground.error');

        openNotificationWithIcon({
          type: NotificationType.ERROR,
          title: t('serviceAgreements.playground.queryTitle'),
          description: sortedError,
        });
        history.push(ONGOING_PLANS);
      }

      setIsCheckingAuth(false);
    };
    initialQuery();
  }, [TOKEN_STORAGE_KEY, history, queryUrl, sessionToken, t]);

  const requestAuthWhenTokenExpired = React.useCallback(() => {
    setQueryable(false);
    removeStorage(TOKEN_STORAGE_KEY);

    openNotificationWithIcon({
      type: NotificationType.ERROR,
      title: t('serviceAgreements.playground.queryTitle'),
      description: t('serviceAgreements.playground.expiredToken'),
    });
  }, [TOKEN_STORAGE_KEY, t]);

  const requireAuth = queryable === false && !isCheckingAuth;
  const showPlayground = queryable && queryUrl && !isCheckingAuth;

  return (
    <div>
      <PlaygroundHeader link={ONGOING_PLANS} linkText={'My Flex Plans'} />
      <div className={styles.deploymentMetaContainer}>
        <div className={styles.deploymentMeta}>
          <DeploymentMeta
            deploymentId={flexPlan?.deployment?.id ?? ''}
            projectMetadata={flexPlan.deployment?.project?.metadata}
          />
        </div>
        <div className={styles.deploymentTable}>
          <Table columns={columns} dataSource={[flexPlan]} rowKey={'id'} pagination={false} />
        </div>
      </div>

      <div className={styles.content}>
        {isCheckingAuth && <Spinner />}
        {requireAuth && (
          <RequestToken
            deploymentId={flexPlan?.deployment?.id ?? ''}
            indexer={flexPlan.indexer}
            consumer={flexPlan.consumer}
            agreement={flexPlan.id}
            requestTokenUrl={requestTokenUrl}
            tokenType={'ConsumerHostToken'}
            onRequestToken={(token: string) => {
              setSessionToken(token);
              console.log(token);
              console.log('ere');
              setEncryptStorage(TOKEN_STORAGE_KEY, token);
            }}
          />
        )}
        {showPlayground && (
          <GraphQLQuery
            queryUrl={queryUrl ?? ''}
            sessionToken={sessionToken}
            onSessionTokenExpire={requestAuthWhenTokenExpired}
          />
        )}
      </div>
    </div>
  );
};
