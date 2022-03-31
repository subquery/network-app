// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Spinner, Typography } from '@subql/react-ui';
import * as React from 'react';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { Table, TableProps, Alert } from 'antd';
import { AppPageHeader, Copy, TabButtons } from '../../../components';
import { useIPFS, useProjectMetadata, useServiceAgreements, useWeb3 } from '../../../containers';
import {
  bnToDate,
  convertBigNumberToNumber,
  formatEther,
  getTrimmedStr,
  mapAsync,
  notEmpty,
  renderAsyncArray,
} from '../../../utils';
import styles from './ServiceAgreements.module.css';
import {
  GetServiceAgreements_serviceAgreements_nodes as ServiceAgreement,
  GetServiceAgreements_serviceAgreements_nodes_deployment_project as SAProject,
} from '../../../__generated__/GetServiceAgreements';
import IndexerName from '../../../components/IndexerDetails/IndexerName';
import { useAsyncMemo } from '../../../hooks';
import { getDeploymentMetadata } from '../../../hooks/useDeploymentMetadata';
import { EmptyList } from '../Plans/EmptyList';

const ROUTE = '/plans/service-agreements';

const Deployment: React.VFC<{ deployment: ServiceAgreement['deployment'] }> = ({ deployment }) => {
  const { catSingle } = useIPFS();
  const meta = useAsyncMemo(
    () => getDeploymentMetadata(catSingle, deployment?.version),
    [deployment?.version, catSingle],
  );

  return (
    <Typography className={'flex'}>
      {`${meta.data?.version} - ${getTrimmedStr(deployment?.id)}`} <Copy value={deployment?.id} />
    </Typography>
  );
};

const Project: React.VFC<{ project: SAProject }> = ({ project }) => {
  const { getMetadataFromCid } = useProjectMetadata();

  const metadata = useAsyncMemo(() => getMetadataFromCid(project.metadata), [project.metadata, getMetadataFromCid]);

  return <Typography>{metadata.data?.name ?? project.id}</Typography>;
};

const ServiceAgreements: React.VFC = () => {
  const { t } = useTranslation();
  const { account } = useWeb3();

  const serviceAgreements = useServiceAgreements({ address: account ?? '' });

  const columns: TableProps<ServiceAgreement>['columns'] = [
    {
      dataIndex: 'id',
      title: '#',
      width: 30,
      align: 'center',
      render: (text: string, _: any, idx: number) => <Typography>{idx + 1}</Typography>,
    },
    {
      dataIndex: 'deployment',
      key: 'project',
      title: t('serviceAgreements.headers.project'),
      align: 'center',
      width: 200,
      render: (deployment: ServiceAgreement['deployment']) =>
        deployment?.project && <Project project={deployment.project} />,
    },
    {
      dataIndex: 'deployment',
      title: t('serviceAgreements.headers.deployment'),
      key: 'deployment',
      align: 'center',
      width: 250,
      render: (deployment: ServiceAgreement['deployment']) => <Deployment deployment={deployment} />,
    },
    {
      dataIndex: 'consumerAddress',
      title: t('serviceAgreements.headers.consumer'),
      key: 'consumer',
      align: 'center',
      render: (consumer: ServiceAgreement['consumerAddress']) => (
        <IndexerName /*name={consumer?.name} image={indexerDetails?.image}*/ address={consumer} />
      ),
    },
    {
      dataIndex: 'indexerAddress',
      title: t('serviceAgreements.headers.indexer'),
      key: 'indexer',
      align: 'center',
      render: (indexer: ServiceAgreement['indexerAddress']) => (
        <IndexerName /*name={consumer?.name} image={indexerDetails?.image}*/ address={indexer} />
      ), // TODO get consumer details
    },
    {
      dataIndex: 'period',
      title: t('serviceAgreements.headers.expiry'),
      key: 'expiry',
      align: 'center',
      render: (_, sa: ServiceAgreement) => (
        <Typography>{moment(sa.startTime).add(convertBigNumberToNumber(sa.period)).utc(true).fromNow()}</Typography>
      ),
    },
    {
      dataIndex: 'value',
      title: t('serviceAgreements.headers.price'),
      key: 'price',
      align: 'center',
      render: (price: ServiceAgreement['value']) => <Typography>{`${formatEther(price)} SQT`}</Typography>,
    },
  ];

  return (
    <div>
      <AppPageHeader title={t('plans.category.myServiceAgreement')} />

      <div className={styles.tabs}>
        <TabButtons tabs={[{ label: 'Ongoing', link: ROUTE }]} whiteTab />
      </div>

      <div className="contentContainer">
        {renderAsyncArray(
          mapAsync((d) => d.serviceAgreements?.nodes.filter(notEmpty), serviceAgreements),
          {
            loading: () => <Spinner />,
            error: (e) => <Typography>{`Failed to load user service agreements: ${e}`}</Typography>,
            empty: () => <EmptyList i18nKey={'serviceAgreements.non'} />,
            data: (data) => {
              return (
                <div>
                  <Table columns={columns} dataSource={data} scroll={{ x: 500 }} />
                </div>
              );
            },
          },
        )}
      </div>
    </div>
  );
};

export default ServiceAgreements;
