// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { BreadcrumbNav } from '@components/BreadcrumbNav';
import { CurEra } from '@components/CurEra';
import { DeploymentMeta } from '@components/DeploymentInfo';
import RpcPlayground from '@components/RpcPlayground/RpcPlayground';
import { Manifest } from '@hooks/useGetDeploymentManifest';
import { Spinner } from '@subql/components';
import { ProjectType } from '@subql/network-query';
import { Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';

import { GraphQLQuery, GraphQLQueryProps } from './GraphQLQuery';
import styles from './Playground.module.css';
import { RequestToken, RequestTokenProps } from './RequestToken';

export const PlaygroundHeader: React.FC<{ link: string; linkText: string }> = ({ link: LINK, linkText }) => {
  const { t } = useTranslation();
  return (
    <div className={styles.header}>
      <BreadcrumbNav backLink={LINK} backLinkText={linkText} childText={t('serviceAgreements.playground.title')} />
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
  type: ProjectType;
  // rpc project only
  rpcFamily?: Manifest['rpcFamily'];

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
  type,
  rpcFamily,

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
      {(type === ProjectType.SUBQUERY || type === ProjectType.SUBGRAPH) && playgroundVisible && (
        <GraphQLQuery {...graphqlQueryProps} />
      )}
      {type === ProjectType.RPC && playgroundVisible && (
        <RpcPlayground
          url={graphqlQueryProps.queryUrl}
          trailToken={graphqlQueryProps.sessionToken || ''}
          rpcFamily={rpcFamily}
        ></RpcPlayground>
      )}
    </div>
  </div>
);
