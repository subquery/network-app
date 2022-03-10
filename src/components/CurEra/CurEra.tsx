// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Spinner, Typography } from '@subql/react-ui';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useEra } from '../../containers';
import { renderAsync } from '../../utils';
import styles from './CurEra.module.css';

export const CurEra: React.FC = () => {
  const { currentEra } = useEra();
  const { t } = useTranslation();

  return (
    <>
      {renderAsync(currentEra, {
        loading: () => <Spinner />,
        error: (e) => <Typography>{`${t('indexer.currentEra')}: -`}</Typography>,
        data: (era) => {
          if (!era) return null;
          return (
            <Typography variant="small" className={styles.eraText}>{`${t('indexer.currentEra')}: ${
              era.index
            }`}</Typography>
          );
        },
      })}
    </>
  );
};
