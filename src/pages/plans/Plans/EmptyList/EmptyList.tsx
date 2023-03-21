// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Typography } from '@subql/react-ui';
import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';

interface EmptyListProps {
  i18nKey?: any;
  link?: string;
}

// TODO: make it more general for all possible scenarios.
export const EmptyList: React.VFC<EmptyListProps> = ({ i18nKey, link }) => {
  const { t } = useTranslation();

  return (
    <Typography>
      <Trans i18nKey={i18nKey ?? 'plans.default.createPlans'}>
        {t(i18nKey ?? 'plans.default.createPlans')}
        {link ? (
          <a href={link} target="_blank" rel="noreferrer">
            here
          </a>
        ) : (
          <a href="https://doc.subquery.network/" target="_blank" rel="noreferrer">
            here
          </a>
        )}
      </Trans>
    </Typography>
  );
};
