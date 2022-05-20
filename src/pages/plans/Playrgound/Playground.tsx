// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Breadcrumb } from 'antd';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router';
import { SERVICE_AGREEMENTS } from '..';
import { CurEra } from '../../../components';
import styles from './Playground.module.css';
import { GetOngoingServiceAgreements_serviceAgreements_nodes as ServiceAgreement } from '../../../__generated__/GetOngoingServiceAgreements';
import { Link } from 'react-router-dom';
import { useIndexerMetadata } from '../../../hooks';
import { getEncryptStorage, setEncryptStorage, wrapProxyEndpoint } from '../../../utils';
import { POST } from '../../../utils/fetch';
import { RequestToken } from './RequestToken';
import { GraphQLQuery } from './GraphQLQuery';
import { defaultQuery } from '../../../components/GraphQLPlayground/GraphQLPlayground';

export const PLAYGROUND_STORAGE_KEY = 'Playground';

export const Playground: React.VFC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const history = useHistory();
  const [authEnable, setAuthEnable] = React.useState<boolean>();

  const locationState = location?.state as { serviceAgreement: ServiceAgreement };

  if (!locationState?.serviceAgreement) {
    history.push(SERVICE_AGREEMENTS);
  }

  const { indexerAddress, deploymentId } = locationState.serviceAgreement;
  const [sessionToken, setSessionToken] = React.useState<string>(
    getEncryptStorage(`${indexerAddress}/${deploymentId}`),
  );
  const indexerMetadata = useIndexerMetadata(indexerAddress);

  React.useEffect(() => {
    if (!locationState?.serviceAgreement || indexerMetadata?.error) {
      history.push(SERVICE_AGREEMENTS);
    }
  }, [locationState?.serviceAgreement, indexerMetadata, history]);

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
        queryUrl: wrapProxyEndpoint(`${url}query/${deploymentId}`, indexerAddress),
        requestTokenUrl: wrapProxyEndpoint(`${url}token`, indexerAddress),
      };
    }
    return {};
  }, [url, deploymentId, indexerAddress]);

  React.useEffect(() => {
    const initialQuery = async () => {
      if (queryUrl) {
        const headers = sessionToken ? { Authorization: `Bearer ${sessionToken}` } : undefined;
        const { response, error } = await POST({ endpoint: queryUrl, requestBody: defaultQuery, headers });
        if (response?.status === 401) {
          setAuthEnable(true);
        }
      }
    };
    initialQuery();
  }, [queryUrl, sessionToken]);

  return (
    <div>
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

      <div className={styles.content}>
        {(authEnable || (url && !sessionToken)) && (
          <RequestToken
            deploymentId={deploymentId}
            requestTokenUrl={requestTokenUrl}
            onRequestToken={(token) => {
              setSessionToken(token);
              setEncryptStorage(`${indexerAddress}/${deploymentId}`, token);
            }}
          />
        )}
        {sessionToken && queryUrl && !authEnable && <GraphQLQuery queryUrl={queryUrl} sessionToken={sessionToken} />}
      </div>
    </div>
  );
};
