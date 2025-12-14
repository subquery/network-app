// Copyright 2020-2025 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { AppPageHeader } from '@components/AppPageHeader';
import { WalletRoute } from '@components/WalletRoute';
import { useWeb3 } from '@containers';
import { ChatBoxPlanTextTrigger, Typography } from '@subql/components';

import { useChatBoxStore } from 'src/stores/chatbox';

import { DelegationList } from './DelegationsList';

export const MyDelegation: React.FC = () => {
  const { t } = useTranslation();
  const { account } = useWeb3();
  const { chatBoxRef } = useChatBoxStore();

  return (
    <>
      <AppPageHeader
        title={
          <div className="col-flex" style={{ gap: '8px' }}>
            <Typography variant="h5">My Delegation</Typography>
            <ChatBoxPlanTextTrigger
              triggerMsg="Advise me on how best I can delegate my SQT."
              chatBoxInstance={chatBoxRef}
            >
              Advise me on how best I can delegate my SQT.
            </ChatBoxPlanTextTrigger>
          </div>
        }
        desc={t('delegate.delegationDesc')}
      />
      <WalletRoute componentMode element={<DelegationList account={account} />} />
    </>
  );
};

export default MyDelegation;
