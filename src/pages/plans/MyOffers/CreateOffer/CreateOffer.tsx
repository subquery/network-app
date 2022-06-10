// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Steps, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import { IoChevronBack } from 'react-icons/io5';
import { AppPageHeader } from '../../../../components';
import styles from './CreateOffer.module.css';
import { Button } from '../../../../components/Button';
import { SelectDeployment } from './SelectDeployment';
import { ChooseTemplate } from './ChooseTemplate';
import { CustomOffer } from './CustomOffer';
import { Summary } from './Summary';
import { getCapitalizedStr } from '../../../../utils';

/** CreateOfferContext shared within 4 steps */
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
  totalSteps: number;
  curStep: number;
  onStepChange: (step: number) => void;
}

export const CreateOfferContext = React.createContext<CreateOfferContextType | null>(null);

/** CreateOfferContext end */

interface IStepButtons {
  totalSteps: number;
  curStep: number;
  onStepChange: (step: number) => void;
  disabled?: boolean;
}

export const StepButtons: React.VFC<IStepButtons> = ({ totalSteps, curStep, disabled = false, onStepChange }) => {
  const { t } = useTranslation();
  const isFirstStep = curStep === 0;
  const isLastStep = curStep < totalSteps - 1;
  return (
    <div className={`${styles.stepButtons} ${isFirstStep ? 'flex-end' : 'flex-between'}`}>
      {!isFirstStep && (
        <Button onClick={() => onStepChange(curStep - 1)} type="text">
          <div className={styles.back}>
            <IoChevronBack /> <Typography.Text>{t('general.back')}</Typography.Text>
          </div>
        </Button>
      )}

      {isLastStep && (
        <Button onClick={() => onStepChange(curStep + 1)} disabled={disabled}>
          {getCapitalizedStr(t('general.next'))}
        </Button>
      )}
    </div>
  );
};

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
  const totalSteps = steps.length;

  return (
    <div>
      <AppPageHeader title={t('myOffers.createOffer')} />

      <div className={styles.content}>
        <div className={styles.steps}>
          <Steps current={curStep} labelPlacement="vertical" size="small">
            {steps.map((step) => (
              <Step title={step} key={step} />
            ))}
          </Steps>
        </div>
        <div>
          <CreateOfferContext.Provider value={{ offer, updateCreateOffer, curStep, onStepChange, totalSteps }}>
            {curStep === 0 && <SelectDeployment />}
            {curStep === 1 && <ChooseTemplate />}
            {curStep === 2 && <CustomOffer />}
            {curStep === 3 && <Summary />}
          </CreateOfferContext.Provider>
        </div>
      </div>
    </div>
  );
};
