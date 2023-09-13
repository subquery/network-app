// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { NotificationType, openNotification } from '@components/Notification';
import { FetcherParams } from '@graphiql/toolkit';
import { useIndexerMetadata } from '@hooks';
import { ServiceAgreementFieldsFragment as ServiceAgreement } from '@subql/network-query';
import { TableProps } from 'antd';
import i18next from 'i18next';
import moment from 'moment';

import { TableText } from '../../../components';
import { ConnectedIndexer } from '../../../components/IndexerDetails/IndexerName';
import { useWeb3 } from '../../../containers';
import {
  formatEther,
  getEncryptStorage,
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

const { CONSUMER_SA_NAV, SA_NAV } = ROUTES;

export const SAPlayground: React.FC = () => {
  const { t } = useTranslation();
  const { account } = useWeb3();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = React.useState<boolean>();
  const [queryable, setQueryable] = React.useState<boolean>();

  const locationState = location?.state as { serviceAgreement: ServiceAgreement };
  const serviceAgreement = locationState?.serviceAgreement;
  const TOKEN_STORAGE_KEY = `${serviceAgreement?.id}/${account}`;
  const [sessionToken, setSessionToken] = React.useState<string>(getEncryptStorage(TOKEN_STORAGE_KEY));
  const { indexerMetadata } = useIndexerMetadata(serviceAgreement?.indexerAddress);
  React.useEffect(() => {
    if (!locationState?.serviceAgreement || serviceAgreement?.consumerAddress !== account) {
      navigate(SA_NAV);
    }
  }, [indexerMetadata, navigate, serviceAgreement?.consumerAddress, account, locationState?.serviceAgreement]);

  const url = React.useMemo(() => {
    const rawUrl = indexerMetadata.url;
    if (rawUrl) {
      const url = new URL(rawUrl);
      return url.toString();
    }
  }, [indexerMetadata]);

  const { queryUrl, requestTokenUrl } = React.useMemo(() => {
    if (url) {
      return {
        queryUrl: wrapProxyEndpoint(`${url}query/${serviceAgreement?.deploymentId}`, serviceAgreement?.indexerAddress),
        requestTokenUrl: wrapProxyEndpoint(`${url}token`, serviceAgreement?.indexerAddress),
      };
    }
    return {};
  }, [url, serviceAgreement?.deploymentId, serviceAgreement?.indexerAddress]);

  const columns: TableProps<ServiceAgreement>['columns'] = [
    {
      dataIndex: 'consumerAddress',
      title: i18next.t('serviceAgreements.headers.consumer').toUpperCase(),
      key: 'consumer',
      render: (consumer: ServiceAgreement['consumerAddress']) => <ConnectedIndexer id={consumer} />,
    },
    {
      dataIndex: 'indexerAddress',
      title: i18next.t('serviceAgreements.headers.indexer').toUpperCase(),
      key: 'indexer',
      render: (indexer: ServiceAgreement['indexerAddress']) => (
        <ConnectedIndexer
          id={indexer}
          onClick={() => {
            navigate(`/indexer/${indexer}`);
          }}
        />
      ),
    },
    {
      dataIndex: 'period',
      title: i18next.t('serviceAgreements.headers.expiry').toUpperCase(),
      key: 'expiry',
      render: (_, sa: ServiceAgreement) => {
        return <TableText content={moment(sa.endTime).utc(true).fromNow()} />;
      },
    },
    {
      dataIndex: 'lockedAmount',
      title: i18next.t('serviceAgreements.headers.price').toUpperCase(),
      key: 'price',
      render: (price: ServiceAgreement['lockedAmount']) => <TableText content={`${formatEther(price)} ${TOKEN}`} />,
    },
  ];

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

      const { response, error } = await POST({
        endpoint: queryUrl,
        requestBody: { query: defaultQuery },
        headers,
      });
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

        const { error: resError } = (await response?.json()) ?? {};
        const sortedError = resError ? parseError(resError) : error?.message ?? t('serviceAgreements.playground.error');

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

  const requestAuthWhenTokenExpired = React.useCallback(() => {
    setQueryable(false);
    removeStorage(TOKEN_STORAGE_KEY);

    openNotification({
      type: NotificationType.ERROR,
      title: t('serviceAgreements.playground.queryTitle'),
      description: t('serviceAgreements.playground.expiredToken'),
    });
  }, [TOKEN_STORAGE_KEY, t]);

  const requireAuth = queryable === false && !isCheckingAuth;
  const showPlayground = !!(queryable && queryUrl && !isCheckingAuth);

  return (
    <AuthPlayground
      headerLink={CONSUMER_SA_NAV}
      headerText={t('serviceAgreements.playground.ongoingAgreements')}
      deploymentId={serviceAgreement.deploymentId}
      projectMetadata={serviceAgreement.deployment?.project?.metadata}
      columns={columns}
      dataSource={[serviceAgreement]}
      rowKey={'id'}
      loading={isCheckingAuth}
      requireAuth={requireAuth}
      requestTokenProps={{
        deploymentId: serviceAgreement.deploymentId,
        indexer: serviceAgreement.indexerAddress,
        consumer: serviceAgreement.consumerAddress,
        agreement: serviceAgreement.id,
        requestTokenUrl: requestTokenUrl,
        tokenType: 'ServiceAgreementToken',
        onRequestToken: (token: string) => {
          setSessionToken(token);
          setEncryptStorage(TOKEN_STORAGE_KEY, token);
        },
      }}
      graphqlQueryProps={{
        queryUrl: queryUrl ?? '',
        sessionToken: sessionToken,
        onSessionTokenExpire: requestAuthWhenTokenExpired,
        fetcher: async (graphQLParams: FetcherParams) =>
          fetcher(queryUrl ?? '', JSON.stringify(graphQLParams), sessionToken),
      }}
      playgroundVisible={showPlayground}
    />
  );
};
