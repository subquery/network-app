// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Typography, Button } from 'antd';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useWeb3 } from '../../../containers';
import styles from './Playground.module.css';
import { requestConsumerHostToken, requestServiceAgreementToken } from '../../../utils/playground';

interface RequestTokenProps {
  indexer: string;
  consumer: string;
  agreement: string;
  deploymentId: string;
  requestTokenUrl: string | undefined;
  tokenType: 'ConsumerHostToken' | 'ServiceAgreementToken';
  onRequestToken?: (token: string) => void;
}

export const RequestToken: React.FC<RequestTokenProps> = ({
  indexer,
  consumer,
  agreement,
  deploymentId,
  requestTokenUrl,
  tokenType,
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

    let sortedResponse;

    if (tokenType === 'ConsumerHostToken') {
      sortedResponse = await requestConsumerHostToken(account ?? '', library);
    } else if (tokenType === 'ServiceAgreementToken') {
      sortedResponse = await requestServiceAgreementToken(
        account ?? '',
        library,
        requestTokenUrl,
        indexer,
        agreement,
        deploymentId,
      );
    }

    onRequestToken && onRequestToken(sortedResponse?.data ?? '');
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
