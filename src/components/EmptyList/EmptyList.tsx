// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Trans } from 'react-i18next';
import { Typography } from '@subql/components';
import { isString } from 'lodash-es';

import styles from './EmptyList.module.css';

interface IEmptyList {
  title?: string;
  description?: React.ReactNode | string | Array<string> | readonly string[];
  infoI18nKey?: string;
  infoLinkDesc?: string;
  infoLink?: string;
  children?: React.ReactNode;
}

export const EmptyList: React.FC<IEmptyList> = ({
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
      <div className={styles.emptyListContent}>
        {title && <Typography className={styles.title}>{title}</Typography>}
        {isString(description) || Array.isArray(description) ? (
          <div className={styles.description}>
            {sortedDescriptions.map((description, idx) => (
              <Typography key={idx}>{description}</Typography>
            ))}
          </div>
        ) : (
          description
        )}
        {infoI18nKey && (
          <Typography className={styles.infoLink}>
            {/* TODO: will fix this ts error when i18n issue fix. */}
            {}
            {/* @ts-ignore */}
            <Trans i18nKey={infoI18nKey}>
              {infoLinkDesc}
              <a href={infoLink ?? '/'} target={'_blank'} rel="noreferrer">
                here
              </a>
            </Trans>
          </Typography>
        )}

        {children && <div className={styles.content}>{children}</div>}
      </div>
    </div>
  );
};
