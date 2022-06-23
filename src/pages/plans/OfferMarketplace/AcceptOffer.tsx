// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import assert from 'assert';
import { Button, Typography } from 'antd';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Spinner } from '@subql/react-ui';
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from 'react-icons/ai';
import { getEthGas } from '@subql/network-clients';
import { Status as AppStatus } from '../../../components';
import { useContracts, useWeb3 } from '../../../containers';
import TransactionModal from '../../../components/TransactionModal';
import { getCapitalizedStr, getDeploymentMetadata, renderAsync, parseError, COLORS } from '../../../utils';
import { useAsyncMemo, useIndexerMetadata } from '../../../hooks';
import { GetDeploymentIndexer_deploymentIndexers_nodes as DeploymentIndexer } from '../../../__generated__/registry/GetDeploymentIndexer';
import { Status } from '../../../__generated__/registry/globalTypes';
import styles from './Marketplace.module.css';
import clsx from 'clsx';
import { deploymentStatus } from '../../../components/Status/Status';

interface IRequirementCheck {
  title: string;
  requiredValue: string | number | undefined;
  value: string | number | undefined;
  passCheck: boolean;
  formatFn?: (value: any) => string | number | React.ReactNode;
  errorMsg?: string;
}

interface ISortedValue {
  value: string | number | undefined;
  formatFn?: (value: any) => string | React.ReactNode;
}

const RequirementCheck: React.FC<IRequirementCheck> = ({
  title,
  requiredValue,
  value,
  passCheck,
  formatFn,
  errorMsg,
}) => {
  const iconSize = 20;
  const iconColor = passCheck ? COLORS.success : COLORS.error;
  const Icon = ({ ...props }) =>
    passCheck ? <AiOutlineCheckCircle {...props} /> : <AiOutlineCloseCircle {...props} />;

  const SortedValue = ({ value, formatFn }: ISortedValue) => {
    if (formatFn) {
      if (['string', 'number'].includes(typeof formatFn(value))) {
        return <Typography.Text>{formatFn(value)}</Typography.Text>;
      }
      return <>{formatFn(value)}</>;
    }

    return <Typography.Text>{value}</Typography.Text>;
  };

  return (
    <div className={styles.requirementCheckItemContainer}>
      <div className={clsx('flex-between-center', styles.requirementCheckItem)}>
        <Typography.Title level={5} type="secondary" className={styles.requirementCheckItemTitle}>
          {title}
        </Typography.Title>
        <SortedValue value={requiredValue} formatFn={formatFn} />
        <SortedValue value={value} formatFn={formatFn} />
        <Icon color={iconColor} size={iconSize} />
      </div>
      {!passCheck && errorMsg && <Typography.Text type={'danger'}>{errorMsg}</Typography.Text>}
    </div>
  );
};

interface ICheckList {
  status: string | undefined;
  deploymentId: string;
  proxyEndpoint: string | undefined;
  offerId: string;
  requiredBlockHeight: number; //TODO: or should use bigInt?
  onSubmit: (params: unknown) => void;
  error?: any;
  isLoading?: boolean;
}

const CheckList: React.VFC<ICheckList> = ({
  status,
  requiredBlockHeight,
  deploymentId,
  offerId,
  proxyEndpoint,
  onSubmit,
  error,
  isLoading,
}) => {
  const { t } = useTranslation();
  const { account: indexer } = useWeb3();

  const deploymentMeta = useAsyncMemo(async () => {
    if (!deploymentId || !proxyEndpoint || !indexer) return null;
    return await getDeploymentMetadata({ deploymentId, indexer, proxyEndpoint });
  }, [deploymentId, indexer, proxyEndpoint]);

  const REQUIRED_STATUS = Status.READY;
  const REQUIRED_PROGRESS = 1;
  const REQUIRED_BLOCKHEIGHT = requiredBlockHeight;

  return renderAsync(deploymentMeta, {
    loading: () => <Spinner />,
    error: (error) => <Typography.Text className="errorText">{`Error: ${parseError(error)}`}</Typography.Text>,
    data: (data) => {
      const latestBlockHeight = data?.lastProcessedHeight;
      const targetBlockHeight = data?.targetHeight;
      const curProgress = latestBlockHeight && targetBlockHeight ? latestBlockHeight / targetBlockHeight : 0;

      const sortedRequirementCheckList = [
        {
          title: t('offerMarket.acceptModal.indexingStatus'),
          requiredValue: REQUIRED_PROGRESS,
          value: curProgress,
          passCheck: REQUIRED_PROGRESS <= curProgress,
          formatFn: (value: number) => `${(value * 100).toFixed(2)} %`,
          errorMsg: t('offerMarket.acceptModal.indexingStatusError'),
        },
        {
          title: t('offerMarket.acceptModal.projectStatus'),
          requiredValue: REQUIRED_STATUS,
          value: status,
          passCheck: REQUIRED_STATUS === status,
          formatFn: (status: string) => <AppStatus text={status} color={deploymentStatus[status]} />,
          errorMsg: t('offerMarket.acceptModal.projectStatusError'),
        },
        {
          title: t('offerMarket.acceptModal.blockHeight'),
          requiredValue: REQUIRED_BLOCKHEIGHT,
          value: latestBlockHeight,
          passCheck: REQUIRED_BLOCKHEIGHT <= (latestBlockHeight ?? 0),
          errorMsg: t('offerMarket.acceptModal.blockHeightError'),
        },
      ];

      const passCheckAmount = sortedRequirementCheckList.filter(
        (requirementCheck) => requirementCheck.passCheck === true,
      );

      return (
        <div className={styles.requirementCheckContainer}>
          <Typography.Title level={4}>
            {t('offerMarket.acceptModal.passCriteria', { count: passCheckAmount.length })}
          </Typography.Title>
          {sortedRequirementCheckList.map((requirementCheck) => (
            <RequirementCheck key={requirementCheck.title} {...requirementCheck} />
          ))}
          {error && <Typography.Text type="danger">{error}</Typography.Text>}
          <div className={clsx(styles.btnContainer, 'flex-end')}>
            <Button onClick={onSubmit} htmlType="submit" shape="round" size="large" type="primary" loading={isLoading}>
              {t('offerMarket.accept')}
            </Button>
          </div>
        </div>
      );
    },
  });
};

type Props = {
  offerId: string;
  deployment: DeploymentIndexer;
  requiredBlockHeight: number;
};

// TODO: SUMMARY LIST
export const AcceptOffer: React.FC<Props> = ({ deployment, offerId, requiredBlockHeight }) => {
  const { t } = useTranslation();
  const { account } = useWeb3();
  const pendingContracts = useContracts();
  const indexerMetadata = useIndexerMetadata(account ?? '');

  const text = {
    title: t('offerMarket.acceptModal.title'),
    steps: [t('offerMarket.acceptModal.check'), t('general.confirmOnMetamask')],
    submitText: t('offerMarket.accept'),
    failureText: t('offerMarket.acceptModal.failureText'),
  };

  const handleClick = async () => {
    const contracts = await pendingContracts;
    assert(contracts, 'Contracts not available');

    const ethGas = await getEthGas('high');

    // TODO: update the root when api ready
    const tempMmrRoot = '0xab3921276c8067fe0c82def3e5ecfd8447f1961bc85768c2a56e6bd26d3c0c55';
    return contracts.purchaseOfferMarket.acceptPurchaseOffer(offerId, tempMmrRoot, ethGas);
  };

  return (
    <TransactionModal
      variant="textBtn"
      text={text}
      actions={[{ label: getCapitalizedStr(t('offerMarket.accept')), key: 'acceptOffer' }]}
      onClick={handleClick}
      renderContent={(onSubmit, _, isLoading, error) => {
        return renderAsync(indexerMetadata, {
          loading: () => <Spinner />,
          error: (error) => (
            <Typography.Text type="danger">{`Failed to get deployment info: ${error.message}`}</Typography.Text>
          ),
          data: (data) => (
            <CheckList
              status={deployment.status}
              deploymentId={deployment.deploymentId}
              proxyEndpoint={data?.url}
              offerId={offerId}
              requiredBlockHeight={requiredBlockHeight}
              onSubmit={onSubmit}
              isLoading={isLoading}
              error={error}
            />
          ),
        });
      }}
    />
  );
};
