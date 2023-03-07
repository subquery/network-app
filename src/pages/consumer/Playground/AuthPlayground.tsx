// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Table } from 'antd';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { CurEra, DeploymentMeta } from '../../../components';
import styles from './Playground.module.css';
import { RequestToken, RequestTokenProps } from './RequestToken';
import { GraphQLQuery, GraphQLQueryProps } from './GraphQLQuery';
import { Spinner } from '@subql/react-ui';
import { ColumnsType } from 'antd/lib/table';
import { BreadcrumbNav } from '@components/BreadcrumbNav/BreadcrumbNav';

export const PlaygroundHeader: React.VFC<{ link: string; linkText: string }> = ({ link: LINK, linkText }) => {
  const { t } = useTranslation();
  return (
    <div className={styles.header}>
      <BreadcrumbNav BACKLINK={LINK} backLinkText={linkText} childText={t('serviceAgreements.playground.title')} />
      <CurEra />
    </div>
  );
};

interface AuthPlaygroundProps {
  headerLink?: string;
  headerText?: string;

  deploymentId?: string;
  projectMetadata?: string;

  columns?: ColumnsType<any>;
  dataSource?: any[];
  rowKey?: string;

  loading?: boolean;
  requireAuth: boolean;

  requestTokenProps: RequestTokenProps;

  playgroundVisible?: boolean;
  graphqlQueryProps: GraphQLQueryProps;
}

export const AuthPlayground: React.FC<AuthPlaygroundProps> = ({
  headerLink,
  headerText,

  deploymentId,
  projectMetadata,

  columns,
  dataSource,
  rowKey,

  loading,
  requireAuth,

  requestTokenProps,

  playgroundVisible,
  graphqlQueryProps,
}) => (
  <div>
    {headerLink && headerText && <PlaygroundHeader link={headerLink} linkText={headerText} />}

    <div className={styles.deploymentMetaContainer}>
      {deploymentId && projectMetadata && (
        <div className={styles.deploymentMeta}>
          <DeploymentMeta deploymentId={deploymentId} projectMetadata={projectMetadata} />
        </div>
      )}

      {columns && dataSource && (
        <div className={styles.deploymentTable}>
          <Table columns={columns} dataSource={dataSource} rowKey={rowKey} pagination={false} />
        </div>
      )}
    </div>

    <div className={styles.content}>
      {loading && <Spinner />}
      {requireAuth && <RequestToken {...requestTokenProps} />}
      {playgroundVisible && <GraphQLQuery {...graphqlQueryProps} />}
    </div>
  </div>
);
