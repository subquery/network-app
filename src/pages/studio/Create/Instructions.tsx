// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button } from '@subql/react-ui';
import styles from './Instructions.module.css';

const Instructions: React.VFC = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <Button
        type="secondary"
        label={t('createInsturctions.button')}
        href="https://doc.subquery.network"
        target="_blank"
      />
      <p className={styles.title}>{t('createInsturctions.title1')}</p>
      <p className={styles.content}>{t('createInsturctions.content1_1')}</p>
      <p className={styles.content}>{t('createInsturctions.content1_2')}</p>
      <p className={styles.code}>{t('createInsturctions.installCommand')}</p>
      <p className={styles.subtitle}>{t('createInsturctions.title2')}</p>
      <p className={styles.content}>{t('createInsturctions.content2')}</p>
      <p className={styles.subtitle}>{t('createInsturctions.title3')}</p>
      <p className={styles.content}>
        <Trans i18nKey="createInsturctions.content3">
          The deployment id, this can be acquired by running <span className={styles.codeInline}>subql publish</span>{' '}
          with the CLI
        </Trans>
      </p>
    </div>
  );
};

export default Instructions;
