// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Typography, Button } from 'antd';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useWeb3 } from '../../../containers';
import styles from './Playground.module.css';
import { parseError } from '../../../utils';
import { POST } from '../../../utils/fetch';
import { authRequestBody, buildTypedMessage } from '../../../utils/eip712';

interface RequestTokenProps {
  indexer: string;
  consumer: string;
  agreement: string;
  deploymentId: string;
  requestTokenUrl: string | undefined;
  onRequestToken?: (token: string) => void;
}

export const RequestToken: React.FC<RequestTokenProps> = ({
  indexer,
  consumer,
  agreement,
  deploymentId,
  requestTokenUrl,
  onRequestToken,
}) => {
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

      const signMsg = buildTypedMessage({
        consumer: account,
        indexer,
        agreement,
        deploymentId,
        timestamp,
      });

      const hash = await library.send('eth_signTypedData_v4', [account, signMsg]);

      const tokenRequestBody = authRequestBody(
        {
          consumer: account,
          timestamp: timestamp,
          indexer,
          agreement,
          deploymentId,
        },
        hash.replace(/^0x/, ''),
      );

      const { response, error } = await POST({ endpoint: requestTokenUrl, requestBody: tokenRequestBody });

      const sortedResponse = response && (await response.json());
      if (response?.ok) {
        onRequestToken && onRequestToken(sortedResponse?.token);
      } else {
        const sortedError = sortedResponse || error;
        throw new Error(parseError(sortedError));
      }
    } catch (error) {
      setError(`Request auth token failure: ${parseError(error)}`);
    }

    setLoading(false);
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
