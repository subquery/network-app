// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import LeftOutlined from '@ant-design/icons/LeftOutlined';
import { Button } from '@components/Button';
import { getCapitalizedStr } from '@utils';

import styles from './StepButton.module.css';

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
