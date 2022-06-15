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
import { cidToBytes32, parseError } from '../../../../../utils';
import { OPEN_OFFERS } from '../../MyOffers';
import { CreateOfferContext, StepButtons, StepType } from '../CreateOffer';
import { DeploymentProject } from '../SelectDeployment';
import styles from './Summary.module.css';

export const Summary: React.VFC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const pendingContracts = useContracts();
  const createOfferContext = React.useContext(CreateOfferContext);

  if (!createOfferContext) return <></>;
  const { curStep, onStepChange, offer } = createOfferContext;

  // TODO: IncreaseAllowance check
  // TODO: Temporary handle contract interaction here
  const handleSubmit = async () => {
    const contracts = await pendingContracts;
    assert(contracts, 'Contracts not available');

    const {
      deploymentId,
      templateId,
      totalDeposit,
      indexerCap: limit,
      minimumIndexedHeight,
      expireDate: expired,
    } = offer;

    const deposit = parseEther(totalDeposit);
    const expireDate = moment(expired).unix(); // to seconds

    try {
      await contracts.purchaseOfferMarket.createPurchaseOffer(
        cidToBytes32(deploymentId),
        templateId,
        deposit,
        limit,
        BigNumber.from(minimumIndexedHeight),
        expireDate,
      );

      openNotificationWithIcon({
        type: NotificationType.SUCCESS,
        title: 'Offer created!',
        description: t('status.changeValidIn15s'),
      });

      history.push(OPEN_OFFERS);
    } catch (error) {
      console.error('handleOfferCreate error', error);
      openNotificationWithIcon({
        type: NotificationType.ERROR,
        title: 'Offer created Failed',
        description: parseError(error),
      });
    }
  };

  const OfferDetailsSummary = [
    {
      label: t('myOffers.step_2.rewardPerIndexer'),
      value: offer?.rewardPerIndexer,
    },
    {
      label: t('myOffers.step_2.totalDeposit'),
      value: offer?.totalDeposit,
    },
    {
      label: t('myOffers.step_2.indexerCap'),
      value: offer?.indexerCap,
    },
    {
      label: t('myOffers.step_2.minimumIndexedHeight'),
      value: offer?.minimumIndexedHeight,
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
          <Typography.Title level={5}>{'Template Id'}</Typography.Title>
          <Typography.Text>{offer.templateId}</Typography.Text>
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
          // disabled={!searchedDeployment?.projectId}
        />
      </div>
    </div>
  );
};
