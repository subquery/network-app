// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button, Typography } from '@subql/components';
import styles from './CreateInstructions.module.css';

const Instruction: React.VFC<{ step: 1 | 2 | 3 | 4 }> = ({ step }) => {
  const { t } = useTranslation();
  return (
    <div className={styles.instruction}>
      <div className={styles.stepCont}>
        <Typography variant="h6" className={styles.step}>
          {t(`create.step${step}.name`)}
        </Typography>
        {step !== 4 && <div className={styles.line} />}
      </div>
      <Typography variant="h5">{t(`create.step${step}.title`)}</Typography>
      <Typography variant="body" className={styles.subtitle}>
        {t(`create.step${step}.subtitle`)}
      </Typography>
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
      <Typography variant="h4">{t('create.title')}</Typography>
      <Typography variant="body" className={styles.mainSubtitle}>
        <Trans i18nKey="create.subtitle">
          Learn how to create a SubQuery project <a href="/" /* TODO proper link*/>here</a>
        </Trans>
      </Typography>
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
