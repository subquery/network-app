// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import assert from 'assert';
import { Button, Typography } from 'antd';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Spinner } from '@subql/react-ui';
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from 'react-icons/ai';
import { getEthGas } from '@subql/network-clients';
import clsx from 'clsx';
import { BigNumber } from 'ethers';
import { Status as AppStatus } from '../../../components';
import moment from 'moment';
import { useContracts, useWeb3 } from '../../../containers';
import TransactionModal from '../../../components/TransactionModal';
import {
  getCapitalizedStr,
  getDeploymentMetadata,
  renderAsync,
  parseError,
  COLORS,
  formatEther,
  convertStringToNumber,
} from '../../../utils';
import { useAsyncMemo, useIndexerMetadata } from '../../../hooks';
import { GetDeploymentIndexer_deploymentIndexers_nodes as DeploymentIndexer } from '../../../__generated__/registry/GetDeploymentIndexer';
import { GetOwnOpenOffers_offers_nodes as Offer } from '../../../__generated__/registry/GetOwnOpenOffers';
import { Status } from '../../../__generated__/registry/globalTypes';
import styles from './Marketplace.module.css';
import { deploymentStatus } from '../../../components/Status/Status';
import { useNetworkClient } from '../../../hooks';

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
  planDuration: string | undefined;
  rewardPerIndexer: string;
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
  rewardPerIndexer,
  planDuration,
  proxyEndpoint,
  onSubmit,
  error,
  isLoading,
}) => {
  const [dailyRewardCapcity, setDailyRewardCapcity] = React.useState<number>();
  const { t } = useTranslation();
  const { account: indexer } = useWeb3();
  const contractClient = useNetworkClient();

  const REQUIRED_STATUS = Status.READY;
  const REQUIRED_BLOCKHEIGHT = requiredBlockHeight;
  const daysOfPlan = moment.duration(planDuration, 'seconds').asDays();
  const REQUIRED_DAILY_REWARD_CAP = convertStringToNumber(formatEther(rewardPerIndexer)) / Math.ceil(daysOfPlan);

  React.useEffect(() => {
    async function getDailyRewardCapcity() {
      if (contractClient && indexer) {
        const dailyRewardCapcity = await contractClient.dailyRewardCapcity(indexer);
        setDailyRewardCapcity(convertStringToNumber(formatEther(dailyRewardCapcity)));
      }
    }
    getDailyRewardCapcity();
  }, [contractClient, indexer, offerId]);

  const deploymentMeta = useAsyncMemo(async () => {
    if (!deploymentId || !proxyEndpoint || !indexer) return null;
    return await getDeploymentMetadata({ deploymentId, indexer, proxyEndpoint });
  }, [deploymentId, indexer, proxyEndpoint]);

  return renderAsync(deploymentMeta, {
    loading: () => <Spinner />,
    error: (error) => <Typography.Text className="errorText">{`Error: ${parseError(error)}`}</Typography.Text>,
    data: (data) => {
      const latestBlockHeight = data?.lastProcessedHeight;

      const sortedRequirementCheckList = [
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
        {
          title: t('offerMarket.acceptModal.dailyRewards'),
          requiredValue: `${REQUIRED_DAILY_REWARD_CAP} SQT`,
          value: `${dailyRewardCapcity} SQT`,
          passCheck: REQUIRED_DAILY_REWARD_CAP <= (dailyRewardCapcity ?? 0),
          errorMsg: t('offerMarket.acceptModal.dailyRewardsError'),
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
          <Typography.Paragraph>{t('offerMarket.acceptModal.afterAcceptOffer')}</Typography.Paragraph>
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
  offer: Offer;
  deployment: DeploymentIndexer;
  requiredBlockHeight: number;
};

// TODO: SUMMARY LIST
export const AcceptOffer: React.FC<Props> = ({ deployment, offer, requiredBlockHeight }) => {
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
    return contracts.purchaseOfferMarket.acceptPurchaseOffer(offer.id, tempMmrRoot, ethGas);
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
              offerId={offer.id}
              rewardPerIndexer={offer.deposit.toString()}
              planDuration={offer.planTemplate?.period.toString()}
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
