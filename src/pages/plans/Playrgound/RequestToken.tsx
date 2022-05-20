// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Typography, Button } from 'antd';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useWeb3 } from '../../../containers';
import styles from './Playground.module.css';
import { parseError } from '../../../utils';
import { POST } from '../../../utils/fetch';

interface RequestTokenProps {
  deploymentId: string;
  requestTokenUrl: string | undefined;
  onRequestToken?: (token: string) => void;
}

export const RequestToken: React.FC<RequestTokenProps> = ({ deploymentId, requestTokenUrl, onRequestToken }) => {
  const { t } = useTranslation();
  const { library, account } = useWeb3();
  const [loading, setLoading] = React.useState<boolean>();
  const [error, setError] = React.useState<string | undefined>();

  const resetError = () => {
    setError(undefined);
  };

  const onRequestTokenClick = async () => {
    setLoading(true);
    try {
      const timestamp = new Date().getTime();
      if (!library || !account || !requestTokenUrl) return;
      const signPayloadWithTimestamp = `${account}${deploymentId}${timestamp}`;
      const hash = await library.getSigner().signMessage(signPayloadWithTimestamp);

      const tokenRequestBody = {
        user_id: account,
        deployment_id: deploymentId,
        signature: hash.replace(/^0x/, ''),
        timestamp: timestamp,
      };

      const { response, error } = await POST({ endpoint: requestTokenUrl, requestBody: tokenRequestBody });
      setLoading(false);
      if (response?.ok) {
        const data = await response.json();
        onRequestToken && onRequestToken(data?.token);
      }
      if (error) {
        setError(parseError(error));
      }
    } catch (error) {
      setError(parseError(error));
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
        loading={loading}
        className={styles.requestTokenBtn}
      >
        {t('serviceAgreements.playground.requestToken')}
      </Button>
    </div>
  );
};
