// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router';
import { Table } from 'antd';
import { DeploymentMeta, Spinner, TableText } from '../../../components';
import styles from './Playground.module.css';
import { GetOngoingFlexPlan_stateChannels_nodes as ConsumerFlexPlan } from '../../../__generated__/registry/GetOngoingFlexPlan';

import {
  formatDate,
  formatEther,
  getEncryptStorage,
  getFlexPlanPrice,
  parseError,
  removeStorage,
  setEncryptStorage,
  TOKEN,
  wrapProxyEndpoint,
} from '../../../utils';
import { POST } from '../../../utils/fetch';
import { useWeb3 } from '../../../containers';
import { NotificationType, openNotificationWithIcon } from '../../../components/TransactionModal/TransactionModal';
import { GraphQLQuery } from './GraphQLQuery';
import { RequestToken } from './RequestToken';
import { PlaygroundHeader } from './SAPlayground';
import { TableProps } from 'antd';
import { ConnectedIndexer } from '../../../components/IndexerDetails/IndexerName';
import { FLEX_PLANS, ONGOING_PLANS } from '../MyFlexPlans/MyFlexPlans';
import { TableTitle } from '../../../components/TableTitle';
import i18next from 'i18next';
import { BigNumber } from 'ethers';
import { defaultQuery, fetcher } from '../../../utils/playgroundTokenReq';

const columns: TableProps<ConsumerFlexPlan>['columns'] = [
  {
    dataIndex: 'indexer',
    title: <TableTitle title={i18next.t('flexPlans.indexer')} />,
    render: (indexer: ConsumerFlexPlan['indexer']) => <ConnectedIndexer id={indexer} />,
  },
  {
    dataIndex: 'price',
    title: <TableTitle title={i18next.t('general.price')} />,
    key: 'price',
    render: (price) => <TableText content={getFlexPlanPrice(price)} />,
  },
  {
    dataIndex: 'expiredAt',
    title: <TableTitle title={i18next.t('flexPlans.validityPeriod')} />,
    key: 'validity',
    render: (expiredAt: ConsumerFlexPlan['expiredAt']) => <TableText content={formatDate(expiredAt)} />,
  },
  {
    dataIndex: 'spent',
    title: <TableTitle title={i18next.t('flexPlans.spent')} />,
    key: 'spent',
    render: (spent: ConsumerFlexPlan['spent']) => <TableText content={`${formatEther(spent)} ${TOKEN}`} />,
  },
  {
    dataIndex: 'spent',
    title: <TableTitle title={i18next.t('flexPlans.remainDeposit')} />,
    render: (spent, plan) => {
      const sortedRemaining = BigNumber.from(plan?.total).sub(BigNumber.from(spent));
      return <TableText content={`${formatEther(sortedRemaining, 4)} ${TOKEN}`} />;
    },
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
    const url = process.env.REACT_APP_CONSUMER_HOST_ENDPOINT;
    return {
      queryUrl: `${url}/users/channels/${flexPlan?.id}/playground`,
      requestTokenUrl: wrapProxyEndpoint(`${url}/token`, flexPlan?.indexer),
    };
  }, [flexPlan?.id, flexPlan?.indexer]);

  /**
   * Query Graphql codes handled
   *
   * 1. 403 => not logged in
   * 2. 401 => require auth for further query
   * 3. other error codes => display in playground
   *
   * Response statuses other than 200: return to previous page
   *
   */
  React.useEffect(() => {
    const initialQuery = async () => {
      setIsCheckingAuth(true);
      if (!queryUrl) return;

      const headers = sessionToken ? { Authorization: `Bearer ${sessionToken}` } : undefined;

      const { response, error } = await POST({
        endpoint: queryUrl,
        headers: headers,
        requestBody: defaultQuery,
      });

      if (response?.status === 404) {
        setQueryable(false);
      }

      const { status } = response || {};
      const res = await response?.json();
      const { code: resCode } = res || {};

      if (resCode === 403 || resCode === 401 || resCode === 1006) {
        //need new session token
        setQueryable(false);
        removeStorage(TOKEN_STORAGE_KEY);
      } else if (status === 200) {
        setQueryable(true);
      } else if (status) {
        setQueryable(undefined);
        removeStorage(TOKEN_STORAGE_KEY);
        const sortedError = error ? parseError(error) : error?.message ?? t('myFlexPlans.playground.error');

        openNotificationWithIcon({
          type: NotificationType.ERROR,
          title: t('serviceAgreements.playground.queryTitle'),
          description: sortedError,
        });
        history.push(FLEX_PLANS);
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
              setEncryptStorage(TOKEN_STORAGE_KEY, token);
            }}
          />
        )}
        {showPlayground && (
          <GraphQLQuery
            queryUrl={queryUrl}
            sessionToken={sessionToken}
            onSessionTokenExpire={requestAuthWhenTokenExpired}
            fetcher={async (graphQLParams) => fetcher(queryUrl, JSON.stringify(graphQLParams.query), sessionToken)}
          />
        )}
      </div>
    </div>
  );
};
