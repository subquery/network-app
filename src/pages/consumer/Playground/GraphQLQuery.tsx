// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Tooltip, Typography } from 'antd';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import jwt_decode from 'jwt-decode';
import { GraphiQL } from '@subql/components';
import styles from './Playground.module.css';
import Countdown from 'react-countdown';
import type { Fetcher } from '@graphiql/toolkit';
export interface GraphQLQueryProps {
  queryUrl: string;
  fetcher: Fetcher;
  sessionToken?: string;
  onSessionTokenExpire?: () => void;
}

export const GraphQLQuery: React.FC<GraphQLQueryProps> = ({
  queryUrl,
  fetcher,
  sessionToken,
  onSessionTokenExpire,
}) => {
  const { t } = useTranslation();
  const decodedToken = sessionToken && (jwt_decode(sessionToken) as any);

  return (
    <>
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
      <div className={styles.playgroundContainer}>
        <GraphiQL url={queryUrl} fetcher={fetcher} />
      </div>
    </>
  );
};
