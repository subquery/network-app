// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Spinner, Typography } from '@subql/react-ui';
import * as React from 'react';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { Table, TableProps } from 'antd';
import { AppPageHeader, Copy, TabButtons, TableText } from '../../../components';
import {
  useExpiredServiceAgreements,
  useIPFS,
  useProjectMetadata,
  useServiceAgreements,
  useWeb3,
} from '../../../containers';
import { formatEther, getTrimmedStr, mapAsync, notEmpty, renderAsyncArray } from '../../../utils';
import styles from './ServiceAgreements.module.css';
import {
  GetOngoingServiceAgreements_serviceAgreements_nodes as ServiceAgreement,
  GetOngoingServiceAgreements_serviceAgreements_nodes_deployment_project as SAProject,
} from '../../../__generated__/GetOngoingServiceAgreements';
import IndexerName from '../../../components/IndexerDetails/IndexerName';
import { useAsyncMemo } from '../../../hooks';
import { getDeploymentMetadata } from '../../../hooks/useDeploymentMetadata';
import { EmptyList } from '../Plans/EmptyList';
import { Redirect, Route, Switch } from 'react-router';

export const ROUTE = '/plans/service-agreements';
export const ONGOING_PLANS = `${ROUTE}/ongoing`;
export const EXPIRED_PLANS = `${ROUTE}/expired`;

const buttonLinks = [
  { label: 'Ongoing', link: ONGOING_PLANS },
  { label: 'Expired', link: EXPIRED_PLANS },
];

const Deployment: React.VFC<{ deployment: ServiceAgreement['deployment'] }> = ({ deployment }) => {
  const { catSingle } = useIPFS();
  const meta = useAsyncMemo(
    () => getDeploymentMetadata(catSingle, deployment?.version),
    [deployment?.version, catSingle],
  );

  return (
    <TableText
      content={
        <div className={'flex'}>
          {`${meta.data?.version} - ${getTrimmedStr(deployment?.id)}`} <Copy value={deployment?.id} />
        </div>
      }
    />
  );
};

const Project: React.VFC<{ project: SAProject }> = ({ project }) => {
  const { getMetadataFromCid } = useProjectMetadata();

  const metadata = useAsyncMemo(() => getMetadataFromCid(project.metadata), [project.metadata, getMetadataFromCid]);

  return <TableText content={metadata.data?.name ?? project.id} />;
};

const ServiceAgreements: React.VFC = () => {
  const { t } = useTranslation();

  const columns: TableProps<ServiceAgreement>['columns'] = [
    {
      dataIndex: 'id',
      title: '#',
      width: 30,
      render: (text: string, _: any, idx: number) => <TableText content={idx + 1} />,
    },
    {
      dataIndex: 'deployment',
      key: 'project',
      title: t('serviceAgreements.headers.project').toUpperCase(),
      width: 200,
      render: (deployment: ServiceAgreement['deployment']) =>
        deployment?.project && <Project project={deployment.project} />,
    },
    {
      dataIndex: 'deployment',
      title: t('serviceAgreements.headers.deployment').toUpperCase(),
      key: 'deployment',
      width: 250,
      render: (deployment: ServiceAgreement['deployment']) => <Deployment deployment={deployment} />,
    },
    {
      dataIndex: 'consumerAddress',
      title: t('serviceAgreements.headers.consumer').toUpperCase(),
      key: 'consumer',
      render: (consumer: ServiceAgreement['consumerAddress']) => (
        <IndexerName /*name={consumer?.name} image={indexerDetails?.image}*/ address={consumer} />
      ),
    },
    {
      dataIndex: 'indexerAddress',
      title: t('serviceAgreements.headers.indexer').toUpperCase(),
      key: 'indexer',
      render: (indexer: ServiceAgreement['indexerAddress']) => (
        <IndexerName /*name={consumer?.name} image={indexerDetails?.image}*/ address={indexer} />
      ), // TODO get consumer details
    },
    {
      dataIndex: 'period',
      title: t('serviceAgreements.headers.expiry').toUpperCase(),
      key: 'expiry',
      render: (_, sa: ServiceAgreement) => {
        return <TableText content={moment(sa.endTime).utc(true).fromNow()} />;
      },
    },
    {
      dataIndex: 'value',
      title: t('serviceAgreements.headers.price').toUpperCase(),
      key: 'price',
      render: (price: ServiceAgreement['value']) => <TableText content={`${formatEther(price)} SQT`} />,
    },
  ];

  const Agreements = ({ queryFn }: { queryFn: typeof useServiceAgreements }) => {
    const [now, setNow] = React.useState<Date>(moment().toDate());
    const { account } = useWeb3();

    React.useEffect(() => {
      const interval = setInterval(() => {
        setNow(moment().toDate());
      }, 60000);
      return () => clearInterval(interval);
    }, []);

    const serviceAgreements = queryFn({ address: account ?? '', now });

    return (
      <div className="contentContainer">
        {renderAsyncArray(
          mapAsync((d) => d.serviceAgreements?.nodes.filter(notEmpty), serviceAgreements),
          {
            loading: () => <Spinner />, // TODO: everytime refetch, it will reload
            error: (e) => <Typography>{`Failed to load user service agreements: ${e}`}</Typography>,
            empty: () => <EmptyList i18nKey={'serviceAgreements.non'} />,
            data: (data) => {
              return <Table columns={columns} dataSource={data} scroll={{ x: 1200 }} />;
            },
          },
        )}
      </div>
    );
  };

  return (
    <div>
      <AppPageHeader title={t('plans.category.myServiceAgreement')} />

      <div className={styles.tabs}>
        <TabButtons tabs={buttonLinks} whiteTab />
      </div>

      <Switch>
        <Route exact path={ONGOING_PLANS} component={() => <Agreements queryFn={useServiceAgreements} />} />
        <Route exact path={EXPIRED_PLANS} component={() => <Agreements queryFn={useExpiredServiceAgreements} />} />
        <Redirect from={ROUTE} to={ONGOING_PLANS} />
      </Switch>
    </div>
  );
};

export default ServiceAgreements;
