// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Breadcrumb, Typography, Button } from 'antd';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router';
import { SERVICE_AGREEMENTS } from '..';
import { CurEra } from '../../../components';
import { useWeb3 } from '../../../containers';
import styles from './Playground.module.css';
import { GetOngoingServiceAgreements_serviceAgreements_nodes as ServiceAgreement } from '../../../__generated__/GetOngoingServiceAgreements';
import { Link } from 'react-router-dom';
import { useIndexerMetadata } from '../../../hooks';
import { parseError, wrapProxyEndpoint } from '../../../utils';
import { useMemo } from 'react';

const RequestToken = ({
  deploymentId,
  requestTokenUrl,
}: {
  deploymentId: string;
  requestTokenUrl: string | undefined;
}) => {
  const { t } = useTranslation();
  const { library, account } = useWeb3();
  const [timestamp, setTimestamp] = React.useState<number>();
  const [signHash, setSignHash] = React.useState<string>();
  const [error, setError] = React.useState<string | undefined>();

  const resetError = () => {
    setError(undefined);
  };

  const onRequestTokenClick = async () => {
    const timestamp = new Date().getTime();
    try {
      if (!library || !account || !requestTokenUrl) return;
      const signPayloadWithTimestamp = `${account}${deploymentId}${timestamp}`;
      const hash = await library.getSigner().signMessage(signPayloadWithTimestamp);

      const tokenRequestBody = {
        user_id: account,
        deployment_id: deploymentId,
        signature: hash.replace(/^0x/, ''),
        timestamp: timestamp,
      };

      const requestToken = await (
        await fetch(requestTokenUrl, {
          method: 'POST',
          body: JSON.stringify(tokenRequestBody),
          headers: {
            'Content-Type': 'application/json',
          },
        })
      ).json();

      console.log('requestToken', requestToken);
    } catch (error) {
      console.error(error);
      setError(`Error: ${parseError(error)}`);
    }
  };

  return (
    <div className={styles.requestToken}>
      <Typography.Title level={3}>{t('serviceAgreements.playground.title')}</Typography.Title>
      <Typography.Text>{t('serviceAgreements.playground.requireSessionToken')}</Typography.Text>
      {error && (
        <Typography.Text type="danger" className={styles.errorText}>
          {error}
        </Typography.Text>
      )}
      <Button
        type="primary"
        shape="round"
        size="large"
        onClick={() => {
          resetError();
          onRequestTokenClick();
        }}
        className={styles.requestTokenBtn}
      >
        {t('serviceAgreements.playground.requestToken')}
      </Button>
    </div>
  );
};

export const Playground: React.VFC = () => {
  const { t } = useTranslation();
  const { library, account } = useWeb3();
  const location = useLocation();
  const history = useHistory();
  const [sessionToken, setSessionToken] = React.useState();
  const [signHash, setSignHash] = React.useState<string>();

  const locationState = location.state as { serviceAgreement: ServiceAgreement };
  const { serviceAgreement } = locationState;
  console.log('serviceAgreement', serviceAgreement);

  if (!serviceAgreement) {
    history.push(SERVICE_AGREEMENTS);
  }

  const { indexerAddress, deploymentId } = serviceAgreement;
  const indexerMetadata = useIndexerMetadata(indexerAddress);

  const url = useMemo(() => {
    const rawUrl = indexerMetadata.data?.url;
    if (rawUrl) {
      const url = new URL(rawUrl);
      return url.toString();
    }
  }, [indexerMetadata.data?.url]);

  const { queryUrl, requestTokenUrl } = useMemo(() => {
    return {
      queryUrl: wrapProxyEndpoint(`${url}/query/${deploymentId}`, indexerAddress),
      requestTokenUrl: wrapProxyEndpoint(`${url}/token`, indexerAddress),
    };
  }, [url, deploymentId, indexerAddress]);

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

      <div className={styles.playground}>
        {url && <RequestToken deploymentId={deploymentId} requestTokenUrl={requestTokenUrl} />}
      </div>
    </div>
  );
};
