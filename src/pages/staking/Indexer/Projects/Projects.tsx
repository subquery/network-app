// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  indexer: string;
}

export const Projects: React.VFC<Props> = ({ indexer }) => {
  const { t } = useTranslation();
  return <div></div>;
};
