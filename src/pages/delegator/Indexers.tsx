// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router';
import { AppPageHeader } from '@components/AppPageHeader';
import { ChatBoxPlanTextTrigger, Typography } from '@subql/components';

import { useChatBoxStore } from 'src/stores/chatbox';

export const Indexers: React.FC = () => {
  const { t } = useTranslation();
  const { chatBoxRef } = useChatBoxStore();
  return (
    <>
      <AppPageHeader
        title={
          <div className="col-flex" style={{ gap: '8px' }}>
            <Typography variant="h5">{t('indexer.indexers')}</Typography>
            <ChatBoxPlanTextTrigger triggerMsg="Which operator should I delegate to?" chatBoxInstance={chatBoxRef}>
              Which operator should I delegate to?
            </ChatBoxPlanTextTrigger>
          </div>
        }
        desc={t('allIndexers.desc')}
      />
      <Outlet></Outlet>
    </>
  );
};

export default Indexers;
