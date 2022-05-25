// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Breadcrumb, Table, TableProps } from 'antd';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router';
import { CurEra, DeploymentMeta, TableText } from '../../../components';
import styles from './Playground.module.css';
import { GetOngoingServiceAgreements_serviceAgreements_nodes as ServiceAgreement } from '../../../__generated__/registry/GetOngoingServiceAgreements';
import { Link } from 'react-router-dom';
import { useIndexerMetadata } from '../../../hooks';
import { formatEther, getEncryptStorage, removeStorage, setEncryptStorage, wrapProxyEndpoint } from '../../../utils';
import { POST } from '../../../utils/fetch';
import { RequestToken } from './RequestToken';
import { GraphQLQuery } from './GraphQLQuery';
import { defaultQuery } from '../../../components/GraphQLPlayground/GraphQLPlayground';
import { useWeb3 } from '../../../containers';
import { NotificationType, openNotificationWithIcon } from '../../../components/TransactionModal/TransactionModal';
import { SERVICE_AGREEMENTS } from '..';
import { ONGOING_PLANS } from '../ServiceAgreements/ServiceAgreements';
import { Spinner } from '@subql/react-ui';
import i18next from 'i18next';
import { ConnectedIndexer } from '../../../components/IndexerDetails/IndexerName';
import { Project } from '../ServiceAgreements/ServiceAgreementsTable';
import moment from 'moment';

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
    render: (indexer: ServiceAgreement['indexerAddress']) => <ConnectedIndexer id={indexer} />,
  },
  {
    dataIndex: 'deployment',
    key: 'project',
    title: i18next.t('serviceAgreements.headers.project').toUpperCase(),
    render: (deployment: ServiceAgreement['deployment']) =>
      deployment?.project && <Project project={deployment.project} />,
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
    dataIndex: 'value',
    title: i18next.t('serviceAgreements.headers.price').toUpperCase(),
    key: 'price',
    render: (price: ServiceAgreement['value']) => <TableText content={`${formatEther(price)} SQT`} />,
  },
];

export const PlaygroundHeader: React.VFC = () => {
  const { t } = useTranslation();
  return (
    <div className={styles.header}>
      <Breadcrumb separator=">">
        <Breadcrumb.Item className={styles.title}>
          <Link to={SERVICE_AGREEMENTS}>{t('serviceAgreements.playground.ongoingAgreements')}</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item className={styles.title}>
          {t('serviceAgreements.playground.auctionAndCrowdloan')}
        </Breadcrumb.Item>
      </Breadcrumb>

      <CurEra />
    </div>
  );
};

export const Playground: React.VFC = () => {
  const { account } = useWeb3();
  const location = useLocation();
  const history = useHistory();
  const [isCheckingAuth, setIsCheckingAuth] = React.useState<boolean>();
  const [queryable, setQueryable] = React.useState<boolean>();

  const locationState = location?.state as { serviceAgreement: ServiceAgreement };
  const serviceAgreement = locationState?.serviceAgreement;
  const TOKEN_STORAGE_KEY = `${serviceAgreement?.id}/${account}`;
  const [sessionToken, setSessionToken] = React.useState<string>(getEncryptStorage(TOKEN_STORAGE_KEY));
  const indexerMetadata = useIndexerMetadata(serviceAgreement?.indexerAddress);

  React.useEffect(() => {
    if (!locationState?.serviceAgreement || indexerMetadata?.error || serviceAgreement?.consumerAddress !== account) {
      history.push(SERVICE_AGREEMENTS);
    }
  }, [indexerMetadata, history, serviceAgreement?.consumerAddress, account, locationState?.serviceAgreement]);

  const url = React.useMemo(() => {
    const rawUrl = indexerMetadata.data?.url;
    if (rawUrl) {
      const url = new URL(rawUrl);
      return url.toString();
    }
  }, [indexerMetadata.data?.url]);

  const { queryUrl, requestTokenUrl } = React.useMemo(() => {
    if (url) {
      return {
        queryUrl: wrapProxyEndpoint(`${url}query/${serviceAgreement?.deploymentId}`, serviceAgreement?.indexerAddress),
        requestTokenUrl: wrapProxyEndpoint(`${url}token`, serviceAgreement?.indexerAddress),
      };
    }
    return {};
  }, [url, serviceAgreement?.deploymentId, serviceAgreement?.indexerAddress]);

  /**
   * Query Graphql
   *
   * 1. 401 => require auth for further query
   * 2. 200 => queryable
   * 3. otherStatusCode => return to serviceAgreementTable
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
        openNotificationWithIcon({
          type: NotificationType.ERROR,
          title: 'Playground query',
          description: 'There is an issue with playground, please check with indexer.' || error?.message, // TODO: Wording redefine
        });
        history.push(ONGOING_PLANS);
      }

      setIsCheckingAuth(false);
    };
    initialQuery();
  }, [TOKEN_STORAGE_KEY, history, queryUrl, sessionToken]);

  const requireAuth = queryable === false && !isCheckingAuth;
  const showPlayground = queryable && queryUrl && !isCheckingAuth;

  return (
    <div>
      <PlaygroundHeader />

      <div className={styles.deploymentMetaContainer}>
        <div className={styles.deploymentMeta}>
          <DeploymentMeta
            deploymentId={serviceAgreement.deploymentId}
            projectMetadata={serviceAgreement.deployment?.project?.metadata}
          />
        </div>
        <div className={styles.deploymentTable}>
          <Table columns={columns} dataSource={[serviceAgreement]} rowKey={'id'} pagination={false} />
        </div>
      </div>

      <div className={styles.content}>
        {isCheckingAuth && <Spinner />}
        {requireAuth && (
          <RequestToken
            deploymentId={serviceAgreement.deploymentId}
            indexer={serviceAgreement.indexerAddress}
            consumer={serviceAgreement.consumerAddress}
            agreement={serviceAgreement.id}
            requestTokenUrl={requestTokenUrl}
            onRequestToken={(token: string) => {
              setSessionToken(token);
              setEncryptStorage(TOKEN_STORAGE_KEY, token);
            }}
          />
        )}
        {showPlayground && <GraphQLQuery queryUrl={queryUrl} sessionToken={sessionToken} />}
      </div>
    </div>
  );
};
