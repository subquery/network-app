// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button, Typography } from '@subql/components';

import styles from './CreateInstructions.module.css';

const Instruction: React.FC<{ step: 1 | 2 | 3 | 4 }> = ({ step }) => {
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
      <Typography variant="text" className={styles.subtitle}>
        {t(`create.step${step}.subtitle`)}
      </Typography>
    </div>
  );
};

type Props = {
  onClick?: () => void;
};

const CreateInstructions: React.FC<Props> = ({ onClick }) => {
  const { t } = useTranslation();
  return (
    <div className={styles.container}>
      <Typography variant="h4">{t('create.title')}</Typography>
      <Typography variant="text" className={styles.mainSubtitle}>
        {/* TODO: this should autofix after using i18n internal ts tips. but that's ok just ignore.
            if anyone saw this TODO and have changed to i18n internal ts tips. happy to remove the following comments.
          */}
        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
        {/* @ts-ignore */}
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
