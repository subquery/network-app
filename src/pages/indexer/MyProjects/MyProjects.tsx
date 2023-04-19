// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { AppPageHeader, EmptyList } from '@components';
import { useWeb3 } from '@containers';
import { OwnDeployments } from './OwnDeployments';
import { URLS } from '@utils';

export const NoDeployment: React.FC = () => {
  const { t } = useTranslation();

  return (
    <EmptyList
      title={t('myProjects.nonProjects')}
      description={t('myProjects.nonProjectDesc')}
      infoI18nKey={'myProjects.learnMore'}
      infoLink={URLS.HOW_TO_INDEX_PROJECTS}
    />
  );
};

export const MyProjects: React.FC = () => {
  const { t } = useTranslation();
  const { account } = useWeb3();

  return (
    <>
      <AppPageHeader title={t('myProjects.title')} />
      <OwnDeployments indexer={account ?? ''} emptyList={<NoDeployment />} desc={t('myProjects.description')} />
    </>
  );
};
