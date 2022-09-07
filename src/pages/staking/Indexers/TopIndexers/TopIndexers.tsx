// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './TopIndexers.module.css';
import { useTopIndexers } from '../../../../containers/QueryTop100Indexers';

export const TopIndexers: React.VFC = () => {
  const { t } = useTranslation();
  const { data } = useTopIndexers();

  return (
    <>
      <div className={styles.dataContent}>Top100 Indexers</div>
    </>
  );
};
