// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Trans } from 'react-i18next';
import { Typography } from '@subql/react-ui';
import styles from './EmptyList.module.css';

interface IEmptyList {
  title: string;
  description?: string | Array<string>;
  infoI18nKey?: string;
  infoLinkDesc?: string;
  infoLink?: string;
  children?: React.ReactNode;
}

export const EmptyList: React.VFC<IEmptyList> = ({
  title,
  description,
  infoI18nKey,
  infoLink,
  infoLinkDesc,
  children,
}) => {
  const sortedDescriptions = Array.isArray(description) ? description : [description];
  return (
    <div className={styles.emptyListContainer}>
      <Typography variant="h5">{title}</Typography>
      <div className={styles.description}>
        {sortedDescriptions.map((description) => (
          <Typography>{description}</Typography>
        ))}
      </div>
      {infoI18nKey && (
        <Typography className={styles.infoLink}>
          <Trans i18nKey={infoI18nKey}>
            {infoLinkDesc}
            <a href={infoLink ?? '/'} target={'_blank'} rel="noreferrer">
              here
            </a>
          </Trans>
        </Typography>
      )}

      {children}
    </div>
  );
};
