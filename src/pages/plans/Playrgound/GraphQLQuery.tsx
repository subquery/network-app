// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Tooltip, Typography } from 'antd';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import jwt_decode from 'jwt-decode';
import { GraphQLPlayground } from '../../../components';
import styles from './Playground.module.css';
import Countdown from 'react-countdown';

interface GraphQLQueryProps {
  queryUrl: string;
  sessionToken?: string;
  onSessionTokenExpire?: () => void;
}

export const GraphQLQuery: React.FC<GraphQLQueryProps> = ({ queryUrl, sessionToken, onSessionTokenExpire }) => {
  const { t } = useTranslation();
  const decodedToken = sessionToken && (jwt_decode(sessionToken) as any);

  return (
    <div className={styles.playground}>
      {sessionToken && (
        <div className={styles.playgroundHeader}>
          <div className={styles.playgroundText}>
            <Typography.Title level={4}>{t('serviceAgreements.playground.sessionToken')}</Typography.Title>
            <Tooltip title={sessionToken}>
              <Typography.Text ellipsis copyable>
                {sessionToken}
              </Typography.Text>
            </Tooltip>
          </div>

          {decodedToken?.exp && (
            <div>
              <Typography.Title level={4}>{t('serviceAgreements.playground.tokenExpireIn')}</Typography.Title>
              <Typography.Text>
                <Countdown
                  date={decodedToken?.exp}
                  daysInHours
                  onComplete={() => {
                    onSessionTokenExpire && onSessionTokenExpire();
                  }}
                />
              </Typography.Text>
            </div>
          )}
        </div>
      )}
      <GraphQLPlayground endpoint={queryUrl} token={sessionToken} />
    </div>
  );
};
