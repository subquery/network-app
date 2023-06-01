// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import delegatorTranslations from './delegator';
import consumerTranslations from './consumer';
import indexerTranslations from './indexer';
import globalTransaltions from './global';
import explorerTranslations from './explorer';

export const en = {
  translation: {
    ...delegatorTranslations,
    ...consumerTranslations,
    ...indexerTranslations,
    ...globalTransaltions,
    ...explorerTranslations,
  },
} as const;

export type Translations = typeof en;

export default en;
