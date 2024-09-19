// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import consumerTranslations from './consumer';
import dashboardTrans from './dashboard';
import delegatorTranslations from './delegator';
import explorerTranslations from './explorer';
import globalTransaltions from './global';
import indexerTranslations from './indexer';
import scanner from './scanner';

export const en = {
  translation: {
    ...delegatorTranslations,
    ...consumerTranslations,
    ...indexerTranslations,
    ...globalTransaltions,
    ...explorerTranslations,
    ...dashboardTrans,
    scanner,
  },
} as const;

export type Translations = typeof en;

export default en;
