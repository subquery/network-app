// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Steps } from 'antd';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import { AppPageHeader } from '../../../../components';
import styles from './CreateOffer.module.css';
import { Button } from '../../../../components/Button';
import { SelectDeployment } from './SelectDeployment';
import { ChooseTemplate } from './ChooseTemplate';
import { CustomOffer } from './CustomOffer';
import { Summary } from './Summary';

export interface IOffer {
  deploymentId?: string;
  templateId?: string;
  totalRewards?: string;
  indexerCap?: number;
  minimumIndexedHeight?: string;
  expireDate?: Date;
}

export interface CreateOfferContextType {
  offer: IOffer | undefined;
  updateCreateOffer: (offer: IOffer) => void;
  curStep: number;
  onStepChange: (step: number) => void;
}

export const CreateOfferContext = React.createContext<CreateOfferContextType | null>(null);

const { Step } = Steps;
const steps = [
  i18next.t('myOffers.steps.step_0'),
  i18next.t('myOffers.steps.step_1'),
  i18next.t('myOffers.steps.step_2'),
  i18next.t('myOffers.steps.step_3'),
];

export const CreateOffer: React.VFC = () => {
  const { t } = useTranslation();
  const [offer, setOffer] = React.useState<IOffer>();
  const [curStep, setCurStep] = React.useState<number>(0);

  const updateCreateOffer = (offer: IOffer) => setOffer(offer);
  const onStepChange = (step: number) => setCurStep(step);

  return (
    <div>
      <AppPageHeader title={t('myOffers.createOffer')} />

      <div className={styles.content}>
        <div className={styles.steps}>
          <Steps current={curStep} labelPlacement="vertical">
            {steps.map((step) => (
              <Step title={step} key={step} />
            ))}
          </Steps>
        </div>
        <div>
          <CreateOfferContext.Provider value={{ offer, updateCreateOffer, curStep, onStepChange }}>
            {curStep === 0 && <SelectDeployment />}
            {curStep === 1 && <ChooseTemplate />}
            {curStep === 2 && <CustomOffer />}
            {curStep === 3 && <Summary />}
          </CreateOfferContext.Provider>
        </div>
        <div>
          {curStep > 0 && (
            <Button onClick={() => setCurStep(curStep - 1)} type="text">
              Back
            </Button>
          )}
          {curStep < steps.length - 1 && <Button onClick={() => setCurStep(curStep + 1)}>Next</Button>}
        </div>
      </div>
    </div>
  );
};
