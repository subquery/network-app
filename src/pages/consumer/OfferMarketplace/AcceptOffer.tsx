// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { StepButtons } from '@components/StepButton';
import { useIndexerMetadata, useProject } from '@hooks';
import { openNotification, Spinner } from '@subql/components';
import { IndexerDeploymentFieldsFragment, OfferFieldsFragment } from '@subql/network-query';
import { useAsyncMemo, useGetIndexerQuery } from '@subql/react-hooks';
import { Typography } from 'antd';
import assert from 'assert';
import moment from 'moment';

import { useWeb3Store } from 'src/stores';

import { DeploymentInfo, SummaryList } from '../../../components';
import TransactionModal from '../../../components/TransactionModal';
import { useWeb3 } from '../../../containers';
import {
  convertBigNumberToNumber,
  convertStringToNumber,
  formatEther,
  formatSecondsDuration,
  getCapitalizedStr,
  getDeploymentMetadata,
  renderAsync,
} from '../../../utils';
import styles from './AcceptOffer.module.css';
import { CheckList } from './CheckList';

interface OfferSummaryProps {
  offer: OfferFieldsFragment;
  onNext: (step: number) => void;
  curStep: number;
}

const OfferSummary: React.FC<OfferSummaryProps> = ({ offer, onNext, curStep }) => {
  const { t } = useTranslation();

  const offerSummary = [
    {
      label: t('myOffers.step_3.consumer'),
      value: offer?.consumer,
    },
    {
      label: t('myOffers.step_2.rewardPerIndexer'),
      value: `${formatEther(offer?.deposit)} SQT`,
    },
    {
      label: t('myOffers.step_2.minimumIndexedHeight'),
      value: t('general.blockWithCount', { count: convertStringToNumber(offer?.minimumAcceptHeight.toString() ?? '') }),
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
      value: moment(offer?.expireDate).format(),
    },
  ];

  return (
    <div>
      <Typography.Title level={4}>{t('offerMarket.acceptModal.offerSummary')}</Typography.Title>
      <div className={styles.offerSummary}>
        {offer?.deployment?.project?.id && (
          <div>
            <DeploymentProject projectId={offer?.deployment.project.id} title={t('myOffers.step_3.deploymentId')} />
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

export const DeploymentProject: React.FC<{ projectId: string; title?: string; deploymentVersion?: string }> = ({
  title,
  projectId,
  deploymentVersion,
}) => {
  const { t } = useTranslation();
  const asyncProject = useProject(projectId);
  return (
    <div className={styles.deploymentInfoContainer}>
      <Typography.Title level={5}>{title ?? t('myOffers.step_0.selectedId')}</Typography.Title>
      {renderAsync(asyncProject, {
        loading: () => <Spinner />,
        error: (error) => <p>{`Failed to load project: ${error.message}`}</p>,
        data: (project) => {
          if (!project) {
            return <></>;
          }

          return (
            <div className={styles.deploymentInfo}>
              <DeploymentInfo
                deploymentId={project.deploymentId}
                project={project.metadata}
                deploymentVersion={deploymentVersion}
              />
            </div>
          );
        },
      })}
    </div>
  );
};

type Props = {
  offer: OfferFieldsFragment;
  deployment: IndexerDeploymentFieldsFragment;
  requiredBlockHeight: number;
  disabled: boolean;
  onAcceptOffer: () => void;
};

export const AcceptOffer: React.FC<Props> = ({ deployment, offer, requiredBlockHeight, disabled, onAcceptOffer }) => {
  const [curStep, setCurStep] = React.useState<number>(0);
  const { t } = useTranslation();
  const { account } = useWeb3();
  const { contracts } = useWeb3Store();
  const indexerQueryInfo = useGetIndexerQuery({ variables: { address: account ?? '' } });
  const { indexerMetadata } = useIndexerMetadata(account || '', {
    cid: indexerQueryInfo.data?.indexer?.metadata,
    immediate: true,
  });

  const deploymentMeta = useAsyncMemo(async () => {
    if (!deployment.deploymentId || !indexerMetadata.url || !account) return { lastHeight: 0 };
    try {
      const metaData = await getDeploymentMetadata({
        deploymentId: deployment.deploymentId,
        indexer: account,
        proxyEndpoint: indexerMetadata.url ?? '',
      });

      return metaData;
    } catch (error: unknown) {
      return { lastHeight: 0, poiHash: '' };
    }
  }, [deployment.deploymentId, account, indexerMetadata.url ?? '']);

  const disableAcceptInfo = React.useMemo(() => {
    const status = disabled || !offer.planTemplate?.active;
    let tooltip = undefined;
    if (disabled) {
      tooltip = t('offerMarket.alreadyAcceptedOffer');
    } else if (!offer.planTemplate?.active) {
      tooltip = t('offerMarket.offerInactive');
    }

    return {
      status,
      tooltip,
    };
  }, [offer, disabled]);

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
    assert(contracts, 'Contracts not available');
    if (!deploymentMeta.data) {
      openNotification({
        type: 'error',
        description: 'Please confirm your metadata can be reach',
      });
    }
    return contracts.purchaseOfferMarket.acceptPurchaseOffer(offer?.id ?? '', deploymentMeta.data?.poiHash || '');
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
          disabled: disableAcceptInfo.status,
          tooltip: disableAcceptInfo.tooltip,
        },
      ]}
      onSuccess={() => onAcceptOffer()}
      onClick={handleClick}
      onClose={() => setCurStep(0)}
      renderContent={(onSubmit, _, isLoading, error) => {
        if (curStep === 0) {
          return <OfferSummary curStep={curStep} onNext={() => setCurStep(curStep + 1)} offer={offer} />;
        }
        return renderAsync(indexerQueryInfo, {
          loading: () => <Spinner />,
          error: (error) => (
            <Typography.Text type="danger">{`Failed to get deployment info: ${error.message}`}</Typography.Text>
          ),
          data: (data) => (
            <CheckList
              status={deployment.status}
              deploymentId={deployment.deploymentId}
              proxyEndpoint={indexerMetadata.url ?? ''}
              offerId={offer?.id}
              rewardPerIndexer={offer?.deposit.toString()}
              planDuration={offer?.planTemplate?.period.toString()}
              requiredBlockHeight={requiredBlockHeight}
              onSubmit={onSubmit}
              isLoading={isLoading}
              error={error}
              deploymentMeta={deploymentMeta}
            />
          ),
        });
      }}
    />
  );
};
