// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router';
import { AppPageHeader } from '@components/AppPageHeader';

export const Indexers: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <AppPageHeader title={t('indexer.indexers')} desc={t('allIndexers.desc')} />
      <Outlet></Outlet>
    </>
  );
};

export default Indexers;
