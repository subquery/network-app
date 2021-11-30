// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import Button from '../Button';
import styles from './CreateInstructions.module.css';

const Instruction: React.VFC<{ step: 1 | 2 | 3 | 4 }> = ({ step }) => {
  const { t } = useTranslation();
  return (
    <div className={styles.instruction}>
      <div className={styles.stepCont}>
        <p className={styles.step}>{t(`create.step${step}.name`)}</p>
        {step !== 4 && <div className={styles.line} />}
      </div>
      <p className={styles.title}>{t(`create.step${step}.title`)}</p>
      <p className={styles.subtitle}>{t(`create.step${step}.subtitle`)}</p>
    </div>
  );
};

type Props = {
  onClick?: () => void;
};

const CreateInstructions: React.VFC<Props> = ({ onClick }) => {
  const { t } = useTranslation();
  return (
    <div className={styles.container}>
      <p className={styles.mainTitle}>{t('create.title')}</p>
      <p className={styles.mainSubtitle}>
        <Trans i18nKey="create.subtitle">
          Learn how to create a SubQuery project <a href="/" /* TODO proper link*/>here</a>
        </Trans>
      </p>
      <div className={styles.instructions}>
        <Instruction step={1} />
        <Instruction step={2} />
        <Instruction step={3} />
        <Instruction step={4} />
      </div>
      <Button type="primary" label={t('create.button')} onClick={onClick} />
    </div>
  );
};

export default CreateInstructions;
