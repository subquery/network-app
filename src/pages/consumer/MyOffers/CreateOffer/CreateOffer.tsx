// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import LeftOutlined from '@ant-design/icons/LeftOutlined';
import { PlanTemplateFieldsFragment as PlanTemplate } from '@subql/network-query';
import { Steps } from 'antd';
import i18next from 'i18next';
import moment from 'moment';

import { Button } from '../../../../components/Button';
import { getCapitalizedStr } from '../../../../utils';
import { ChooseTemplate } from './ChooseTemplate';
import styles from './CreateOffer.module.css';
import { EXPIRE_DATE_GAP, EXPIRE_DATE_GAP_UNIT, OfferDetails } from './OfferDetails';
import { SelectDeployment } from './SelectDeployment';
import { Summary } from './Summary';

/** CreateOfferContext shared within 4 steps */
export interface IOffer {
  deploymentId: string;
  templateId: string;
  planTemplate?: PlanTemplate;
  rewardPerIndexer: string;
  totalDeposit: string;
  indexerCap: number;
  minimumIndexedHeight: number;
  expireDate: Date;
  projectId: string;
}

const initialOffer = {
  deploymentId: '',
  templateId: '',
  planTemplate: undefined,
  rewardPerIndexer: '1',
  totalDeposit: '0',
  indexerCap: 1,
  minimumIndexedHeight: 1,
  expireDate: moment().add(EXPIRE_DATE_GAP, EXPIRE_DATE_GAP_UNIT).toDate(),
  projectId: '',
};

export interface CreateOfferContextType {
  offer: IOffer;
  updateCreateOffer: (offer: IOffer) => void;
  totalSteps: number;
  curStep: number;
  onStepChange: (step: number) => void;
}

export const CreateOfferContext = React.createContext<CreateOfferContextType | null>(null);

/** CreateOfferContext end */

export enum StepType {
  BACK,
  NEXT,
}
interface IStepButtons {
  curStep: number;
  onStepChange: (step: number, type: StepType) => void;
  disabled?: boolean;
  loading?: boolean;
  submitType?: boolean;
}

export const StepButtons: React.FC<IStepButtons> = ({ loading, curStep, disabled = false, onStepChange }) => {
  const { t } = useTranslation();
  const isFirstStep = curStep === 0;
  return (
    <div className={`${styles.stepButtons} ${isFirstStep ? 'flex-end' : 'flex-between'}`}>
      {!isFirstStep && (
        <Button
          onClick={() => onStepChange(curStep - 1, StepType.BACK)}
          type="text"
          loading={loading}
          icon={<LeftOutlined />}
        >
          {t('general.back')}
        </Button>
      )}

      <Button onClick={() => onStepChange(curStep + 1, StepType.NEXT)} disabled={disabled} loading={loading}>
        {getCapitalizedStr(t('general.next'))}
      </Button>
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

export const CreateOffer: React.FC = () => {
  const [offer, setOffer] = React.useState<IOffer>(initialOffer);
  const [curStep, setCurStep] = React.useState<number>(0);

  const updateCreateOffer = (offer: IOffer) => setOffer(offer);
  const onStepChange = (step: number) => setCurStep(step);
  const totalSteps = steps.length;

  return (
    <div>
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
            {curStep === 2 && <OfferDetails />}
            {curStep === 3 && <Summary />}
          </CreateOfferContext.Provider>
        </div>
      </div>
    </div>
  );
};
