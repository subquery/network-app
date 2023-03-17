// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { AppPageHeader, EmptyList, Button } from '../../../components';
import { useWeb3 } from '../../../containers';
import { OwnDeployments } from './OwnDeployments';
import { ROUTES, URLS } from '../../../utils';
import { NavLink } from 'react-router-dom';

export const NoDeployment: React.VFC = () => {
  const { t } = useTranslation();

  return (
    <EmptyList
      title={t('myProjects.nonProjects')}
      description={t('myProjects.nonProjectDesc')}
      infoI18nKey={'myProjects.learnMore'}
      infoLink={URLS.HOW_TO_INDEX_PROJECTS}
    >
      <Button>
        <NavLink to={ROUTES.EXPLORER}>{t('header.explorer')}</NavLink>
      </Button>
    </EmptyList>
  );
};

export const MyProjects: React.VFC = () => {
  const { t } = useTranslation();
  const { account } = useWeb3();

  return (
    <>
      <AppPageHeader title={t('myProjects.title')} />
      <OwnDeployments indexer={account ?? ''} emptyList={<NoDeployment />} desc={t('myProjects.description')} />
    </>
  );
};
