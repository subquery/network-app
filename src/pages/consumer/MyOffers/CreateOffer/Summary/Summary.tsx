// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { NotificationType, openNotification } from '@components/Notification';
import { assert } from '@polkadot/util';
import { EVENT_TYPE, EventBus } from '@utils/eventBus';
import { Typography } from 'antd';
import dayjs from 'dayjs';
import { BigNumber } from 'ethers';
import { parseEther } from 'ethers/lib/utils';

import { useWeb3Store } from 'src/stores';

import { SummaryList } from '../../../../../components';
import {
  cidToBytes32,
  convertBigNumberToNumber,
  convertStringToNumber,
  formatEther,
  formatSecondsDuration,
  parseError,
  TOKEN,
} from '../../../../../utils';
import { ROUTES } from '../../../../../utils';
import { CreateOfferContext, StepButtons, StepType } from '../CreateOffer';
import { DeploymentProject } from '../SelectDeployment';
import styles from './Summary.module.css';

const { CONSUMER_OPEN_OFFERS_NAV } = ROUTES;

export const Summary: React.FC = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = React.useState(false);
  const navigate = useNavigate();
  const { contracts } = useWeb3Store();
  const createOfferContext = React.useContext(CreateOfferContext);

  if (!createOfferContext) return <></>;
  const { curStep, onStepChange, offer } = createOfferContext;

  const handleSubmit = async () => {
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
    const expireDate = dayjs(expired).unix(); // to seconds

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

      openNotification({
        title: 'Offer transaction submitted.',
        description: t('status.txSubmitted'),
      });

      navigate(CONSUMER_OPEN_OFFERS_NAV);

      tx.wait().then(() => {
        openNotification({
          type: NotificationType.SUCCESS,
          title: 'Offer created!',
          description: t('status.changeValidIn15s'),
        });
        EventBus.$dispatch(EVENT_TYPE.CREATED_CONSUMER_OFFER, 'success');
      });
    } catch (error) {
      openNotification({
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
      value: `${offer?.rewardPerIndexer} ${TOKEN}`,
    },
    {
      label: t('myOffers.step_2.totalDeposit'),
      value: `${formatEther(offer?.totalDeposit)} ${TOKEN}`,
    },
    {
      label: t('myOffers.step_2.indexerCap'),
      value: t('myOffers.step_2.indexerCapWithCount', { count: offer?.indexerCap, defaultValue: '' }),
    },
    {
      label: t('myOffers.step_2.minimumIndexedHeight'),
      value: t('general.blockWithCount', {
        count: offer?.minimumIndexedHeight,
      }),
    },
    {
      label: t('myOffers.step_2.expireDate'),
      value: offer?.expireDate ? dayjs(offer.expireDate).format() : dayjs(),
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
