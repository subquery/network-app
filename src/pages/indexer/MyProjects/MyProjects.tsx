// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { AppPageHeader } from '@components/AppPageHeader';
import { EmptyList } from '@components/EmptyList';
import { WalletRoute } from '@components/WalletRoute';
import { useWeb3 } from '@containers';
import { ChatBoxPlanTextTrigger, Typography } from '@subql/components';
import { URLS } from '@utils';

import { useChatBoxStore } from 'src/stores/chatbox';

import { OwnDeployments } from './OwnDeployments';

export const NoDeployment: React.FC = () => {
  const { t } = useTranslation();

  return (
    <EmptyList
      title={t('myProjects.nonProjects')}
      description={
        <div className="col-flex" style={{ gap: 8 }}>
          <Typography>{t('myProjects.nonProjectDesc')}</Typography>
        </div>
      }
      infoI18nKey={'myProjects.learnMore'}
      infoLink={URLS.HOW_TO_INDEX_PROJECTS}
    />
  );
};

export const MyProjects: React.FC = () => {
  const { t } = useTranslation();
  const { account } = useWeb3();
  const chatboxStore = useChatBoxStore();

  return (
    <>
      <AppPageHeader
        title={
          <div>
            <Typography variant="h5">{t('myProjects.title')}</Typography>

            <ChatBoxPlanTextTrigger
              triggerMsg="Which projects should I running?"
              chatBoxInstance={chatboxStore.chatBoxRef}
            >
              Give me advice on which projects to running
            </ChatBoxPlanTextTrigger>
          </div>
        }
      />
      <WalletRoute
        componentMode
        element={
          <OwnDeployments indexer={account ?? ''} emptyList={<NoDeployment />} desc={t('myProjects.description')} />
        }
      ></WalletRoute>
    </>
  );
};

export default MyProjects;
