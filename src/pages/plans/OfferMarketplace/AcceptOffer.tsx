// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import assert from 'assert';
import { Typography } from 'antd';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Spinner } from '@subql/react-ui';
import moment from 'moment';
import { useContracts, useWeb3 } from '../../../containers';
import TransactionModal from '../../../components/TransactionModal';
import {
  convertBigNumberToNumber,
  convertStringToNumber,
  formatEther,
  formatSecondsDuration,
  getCapitalizedStr,
  renderAsync,
} from '../../../utils';
import { useIndexerMetadata } from '../../../hooks';
import { GetDeploymentIndexer_deploymentIndexers_nodes as DeploymentIndexer } from '../../../__generated__/registry/GetDeploymentIndexer';
import { GetOwnOpenOffers_offers_nodes as Offer } from '../../../__generated__/registry/GetOwnOpenOffers';
import { CheckList } from './CheckList';
import styles from './AcceptOffer.module.css';
import { DeploymentProject } from '../MyOffers/CreateOffer/SelectDeployment';
import { StepButtons } from '../MyOffers/CreateOffer';
import { SummaryList } from '../../../components';

interface OfferSummaryProps {
  offer: Offer;
  onNext: (step: number) => void;
  curStep: number;
}

const OfferSummary: React.VFC<OfferSummaryProps> = ({ offer, onNext, curStep }) => {
  const { t } = useTranslation();

  const offerSummary = [
    {
      label: t('myOffers.step_3.consumer'),
      value: offer.consumer,
    },
    {
      label: t('myOffers.step_2.rewardPerIndexer'),
      value: `${formatEther(offer.deposit)} SQT`,
    },
    {
      label: t('myOffers.step_2.minimumIndexedHeight'),
      value: t('general.blockWithCount', { count: convertStringToNumber(offer.minimumAcceptHeight.toString()) }),
    },
    {
      label: t('plans.headers.period'),
      value: formatSecondsDuration(convertBigNumberToNumber(offer?.planTemplate?.period ?? 0)),
    },
    {
      label: t('plans.headers.dailyReqCap'),
      value: t('plans.default.query', {
        count: convertStringToNumber(offer?.planTemplate?.dailyReqCap.toString() ?? '0'),
      }),
    },
    {
      label: t('plans.headers.rateLimit'),
      value: `${
        offer?.planTemplate?.rateLimit ? `${offer?.planTemplate?.rateLimit} ${t('plans.default.requestPerMin')}` : '-'
      }`,
    },
    {
      label: t('myOffers.step_2.expireDate'),
      value: moment(offer.expireDate).format(),
    },
  ];

  return (
    <div>
      <Typography.Title level={4}>{t('offerMarket.acceptModal.offerSummary')}</Typography.Title>
      <div className={styles.offerSummary}>
        {offer.deployment?.project?.id && (
          <div>
            <DeploymentProject projectId={offer.deployment.project.id} title={t('myOffers.step_3.deploymentId')} />
          </div>
        )}
        <SummaryList list={offerSummary} />
        <Typography.Paragraph>{t('offerMarket.acceptModal.moveFromSummary')}</Typography.Paragraph>
        <StepButtons
          curStep={curStep}
          onStepChange={(step) => {
            onNext(step);
          }}
        />
      </div>
    </div>
  );
};

type Props = {
  offer: Offer;
  deployment: DeploymentIndexer;
  requiredBlockHeight: number;
  offerAccepted: boolean;
};

export const AcceptOffer: React.FC<Props> = ({ deployment, offer, requiredBlockHeight, offerAccepted }) => {
  const [curStep, setCurStep] = React.useState<number>(0);
  const { t } = useTranslation();
  const { account } = useWeb3();
  const pendingContracts = useContracts();
  const indexerMetadata = useIndexerMetadata(account ?? '');

  const text = {
    title: t('offerMarket.acceptModal.title'),
    steps: [
      t('offerMarket.acceptModal.offerSummary'),
      t('offerMarket.acceptModal.check'),
      t('general.confirmOnMetamask'),
    ],
    submitText: t('offerMarket.accept'),
    failureText: t('offerMarket.acceptModal.failureText'),
  };

  const handleClick = async () => {
    const contracts = await pendingContracts;
    assert(contracts, 'Contracts not available');

    // TODO: update the root when api ready
    const tempMmrRoot = '0xab3921276c8067fe0c82def3e5ecfd8447f1961bc85768c2a56e6bd26d3c0c55';
    return contracts.purchaseOfferMarket.acceptPurchaseOffer(offer.id, tempMmrRoot);
  };

  return (
    <TransactionModal
      variant="textBtn"
      currentStep={curStep}
      text={text}
      actions={[
        {
          label: getCapitalizedStr(t('offerMarket.accept')),
          key: 'acceptOffer',
          disabled: offerAccepted,
          tooltip: offerAccepted ? t('offerMarket.disableAlreadyAcceptedOffer') : undefined,
        },
      ]}
      onClick={handleClick}
      onClose={() => setCurStep(0)}
      renderContent={(onSubmit, _, isLoading, error) => {
        if (curStep === 0) {
          return <OfferSummary curStep={curStep} onNext={() => setCurStep(curStep + 1)} offer={offer} />;
        }
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
