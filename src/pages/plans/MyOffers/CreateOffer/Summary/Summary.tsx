// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { assert } from '@polkadot/util';
import { Typography } from 'antd';
import { BigNumber } from 'ethers';
import { parseEther } from 'ethers/lib/utils';
import moment from 'moment';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';
import { SummaryList } from '../../../../../components';
import {
  NotificationType,
  openNotificationWithIcon,
} from '../../../../../components/TransactionModal/TransactionModal';
import { useContracts } from '../../../../../containers';
import {
  cidToBytes32,
  convertBigNumberToNumber,
  convertStringToNumber,
  formatSecondsDuration,
  parseError,
} from '../../../../../utils';
import { OPEN_OFFERS } from '../../MyOffers';
import { CreateOfferContext, StepButtons, StepType } from '../CreateOffer';
import { DeploymentProject } from '../SelectDeployment';
import styles from './Summary.module.css';

export const Summary: React.VFC = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = React.useState(false);
  const history = useHistory();
  const pendingContracts = useContracts();
  const createOfferContext = React.useContext(CreateOfferContext);

  if (!createOfferContext) return <></>;
  const { curStep, onStepChange, offer } = createOfferContext;

  const handleSubmit = async () => {
    const contracts = await pendingContracts;
    assert(contracts, 'Contracts not available');

    const {
      deploymentId,
      templateId,
      rewardPerIndexer,
      indexerCap: limit,
      minimumIndexedHeight,
      expireDate: expired,
    } = offer;

    const deposit = parseEther(rewardPerIndexer);
    const expireDate = moment(expired).unix(); // to seconds

    try {
      setIsLoading(true);
      const tx = await contracts.purchaseOfferMarket.createPurchaseOffer(
        cidToBytes32(deploymentId),
        templateId,
        deposit,
        limit,
        BigNumber.from(minimumIndexedHeight),
        expireDate,
      );

      openNotificationWithIcon({
        title: 'Offer transaction submitted.',
        description: t('status.txSubmitted'),
      });

      history.push(OPEN_OFFERS);

      tx.wait().then(() => {
        openNotificationWithIcon({
          type: NotificationType.SUCCESS,
          title: 'Offer created!',
          description: t('status.changeValidIn15s'),
        });
      });
    } catch (error) {
      console.error('handleOfferCreate error', error);
      openNotificationWithIcon({
        type: NotificationType.ERROR,
        title: 'Offer created Failed',
        description: parseError(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const TemplateDetailsSummary = [
    {
      label: t('plans.headers.id'),
      value: offer?.planTemplate?.id,
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
  ];

  const OfferDetailsSummary = [
    {
      label: t('myOffers.step_2.rewardPerIndexer'),
      value: `${offer?.rewardPerIndexer} SQT`,
    },
    {
      label: t('myOffers.step_2.totalDeposit'),
      value: `${offer?.totalDeposit} SQT`,
    },
    {
      label: t('myOffers.step_2.indexerCap'),
      value: t('myOffers.step_2.indexer', { count: offer?.indexerCap }),
    },
    {
      label: t('myOffers.step_2.minimumIndexedHeight'),
      value: t('general.block', { count: offer?.minimumIndexedHeight }),
    },
    {
      label: t('myOffers.step_2.expireDate'),
      value: offer?.expireDate ? moment(offer.expireDate).format() : moment(),
    },
  ];

  return (
    <div>
      <Typography.Title level={4}>{t('myOffers.step_3.title')}</Typography.Title>
      <div className={styles.searchDeployment}>
        <div>
          <DeploymentProject projectId={offer?.projectId} title={t('myOffers.step_3.deploymentId')} />
        </div>

        <div>
          <SummaryList title={t('myOffers.step_3.offerTemplate')} list={TemplateDetailsSummary} />
        </div>

        <div>
          <SummaryList title={t('myOffers.step_3.detailSettings')} list={OfferDetailsSummary} />
        </div>

        <StepButtons
          curStep={curStep}
          onStepChange={(step, stepType) => {
            if (stepType === StepType.NEXT) {
              handleSubmit();
            } else {
              onStepChange(step);
            }
          }}
          // disabled={isLoading}
          loading={isLoading}
        />
      </div>
    </div>
  );
};
