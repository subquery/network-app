// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Typography } from 'antd';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { CreateOfferContext, StepButtons } from '../CreateOffer';
import styles from './ChooseTemplate.module.css';

export const ChooseTemplate: React.VFC = () => {
  const { t } = useTranslation();

  const createOfferContext = React.useContext(CreateOfferContext);

  if (!createOfferContext) return <></>;
  const { curStep, onStepChange, totalSteps } = createOfferContext;

  return (
    <div>
      <Typography.Title level={4}>{t('myOffers.steps.step_1')}</Typography.Title>

      <div className={styles.searchDeployment}>
        <StepButtons totalSteps={totalSteps} curStep={curStep} onStepChange={onStepChange} />
      </div>
    </div>
  );
};
