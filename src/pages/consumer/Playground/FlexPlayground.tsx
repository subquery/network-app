// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { NotificationType, openNotification } from '@components/Notification';
import { FetcherParams } from '@graphiql/toolkit';
import { useGetDeploymentManifest } from '@hooks/useGetDeploymentManifest';
import { Spinner, TableTitle } from '@subql/components';
import { ProjectType, StateChannelFieldsFragment as ConsumerFlexPlan } from '@subql/network-query';
import { renderAsync, useGetConsumerFlexPlanQuery } from '@subql/react-hooks';
import { TableProps } from 'antd';
import { BigNumber } from 'ethers';
import i18next from 'i18next';

import { TableText } from '../../../components';
import { ConnectedIndexer } from '../../../components/IndexerDetails/IndexerName';
import { useWeb3 } from '../../../containers';
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
import { ROUTES } from '../../../utils';
import { defaultQuery, fetcher } from '../../../utils/eip721SignTokenReq';
import { POST } from '../../../utils/fetch';
import { AuthPlayground } from './AuthPlayground';

const { ONGOING_PLANS_NAV } = ROUTES;

export const FlexPlayground: React.FC = () => {
  const { t } = useTranslation();
  const { account } = useWeb3();
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const consumerFlexPlan = useGetConsumerFlexPlanQuery({
    variables: {
      id,
    },
  });

  const { manifest } = useGetDeploymentManifest(consumerFlexPlan.data?.stateChannel?.deployment?.id);

  const [isCheckingAuth, setIsCheckingAuth] = React.useState<boolean>();
  const [queryable, setQueryable] = React.useState<boolean>();
  const [sessionToken, setSessionToken] = React.useState<string>('');

  const TOKEN_STORAGE_KEY = React.useMemo(() => {
    const { data: { stateChannel: flexPlan } = {} } = consumerFlexPlan;
    return `${flexPlan?.id}/${account}`;
  }, [consumerFlexPlan, account]);

  const { queryUrl, requestTokenUrl } = React.useMemo(() => {
    const { data: { stateChannel: flexPlan } = {} } = consumerFlexPlan;

    if (!flexPlan)
      return {
        queryUrl: '',
        requestTokenUrl: '',
      };

    const url = import.meta.env.VITE_CONSUMER_HOST_ENDPOINT;
    return {
      queryUrl: `${url}/users/channels/${flexPlan.id}/playground`,
      requestTokenUrl: wrapProxyEndpoint(`${url}/token`, flexPlan.indexer),
    };
  }, [consumerFlexPlan]);

  const requireAuth = React.useMemo(() => {
    return queryable === false && !isCheckingAuth;
  }, [isCheckingAuth, queryable]);

  const showPlayground = React.useMemo(() => {
    return !!(queryable && queryUrl && !isCheckingAuth);
  }, [queryable, queryUrl, isCheckingAuth]);

  const columns: TableProps<ConsumerFlexPlan>['columns'] = [
    {
      dataIndex: 'indexer',
      title: <TableTitle title={i18next.t('flexPlans.indexer')} />,
      render: (indexer: ConsumerFlexPlan['indexer']) => (
        <ConnectedIndexer
          id={indexer}
          onClick={() => {
            navigate(`/indexer/${indexer}`);
          }}
        />
      ),
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
        requestBody: { query: defaultQuery },
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
        const sortedError = error ? parseError(error) : error?.message ?? t('myFlexPlans.error');

        openNotification({
          type: NotificationType.ERROR,
          title: t('serviceAgreements.playground.queryTitle'),
          description: sortedError,
        });
        navigate(-1);
      }

      setIsCheckingAuth(false);
    };
    initialQuery();
  }, [TOKEN_STORAGE_KEY, navigate, queryUrl, sessionToken, t]);

  React.useEffect(() => {
    if (TOKEN_STORAGE_KEY) {
      setSessionToken(getEncryptStorage(TOKEN_STORAGE_KEY));
    }
  }, [TOKEN_STORAGE_KEY]);

  const requestAuthWhenTokenExpired = React.useCallback(() => {
    setQueryable(false);
    removeStorage(TOKEN_STORAGE_KEY);

    openNotification({
      type: NotificationType.ERROR,
      title: t('serviceAgreements.playground.queryTitle'),
      description: t('serviceAgreements.playground.expiredToken'),
    });
  }, [TOKEN_STORAGE_KEY, t]);

  return renderAsync(consumerFlexPlan, {
    loading: () => <Spinner></Spinner>,
    error: (e) => <div>{parseError(e)}</div>,
    data: (fetchedFlexPlan) => {
      const { stateChannel: flexPlan } = fetchedFlexPlan;
      if (!flexPlan) return <></>;

      return (
        <AuthPlayground
          headerLink={ONGOING_PLANS_NAV}
          headerText={t('plans.category.myFlexPlans')}
          deploymentId={flexPlan?.deployment?.id ?? ''}
          projectMetadata={flexPlan?.deployment?.project?.metadata}
          type={flexPlan.deployment?.project?.type || ProjectType.SUBQUERY}
          rpcFamily={manifest?.rpcFamily}
          columns={columns}
          dataSource={[flexPlan]}
          rowKey={'id'}
          loading={isCheckingAuth}
          requireAuth={requireAuth}
          requestTokenProps={{
            deploymentId: flexPlan?.deployment?.id ?? '',
            indexer: flexPlan.indexer,
            consumer: flexPlan.consumer,
            agreement: flexPlan.id,
            requestTokenUrl: requestTokenUrl,
            tokenType: 'ConsumerHostToken',
            onRequestToken: (token: string) => {
              setSessionToken(token);
              setEncryptStorage(TOKEN_STORAGE_KEY, token);
            },
          }}
          graphqlQueryProps={{
            queryUrl: queryUrl,
            sessionToken: sessionToken,
            onSessionTokenExpire: requestAuthWhenTokenExpired,
            fetcher: async (graphQLParams: FetcherParams) =>
              fetcher(queryUrl, JSON.stringify(graphQLParams), sessionToken),
          }}
          playgroundVisible={showPlayground}
        />
      );
    },
  });
};
