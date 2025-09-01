// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { PropsWithChildren, useCallback, useEffect, useRef } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AlertBanner from '@components/AlertBanner/AlertBanner';
import { ChainStatus } from '@components/ConnectWallet';
import { Header } from '@components/Header';
import { AppInitProvider } from '@containers/AppInitialProvider';
import { useAccount } from '@containers/Web3';
import { useEthersProviderWithPublic, useEthersSigner } from '@hooks/useEthersProvider';
import { ChatBox, ChatBoxRef, SubqlProvider } from '@subql/components';

import { RainbowProvider } from './config/rainbowConf';
import { useChatBoxStore } from './stores/chatbox';
import {
  IPFSProvider,
  ProjectMetadataProvider,
  ProjectRegistryProvider,
  QueryApolloProvider,
  SQTokenProvider,
} from './containers';
import RouterComponent from './router';

import './App.css';

// TODO: Remove SQTProvider
const Providers: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <IPFSProvider initialState={{ gateway: import.meta.env.VITE_IPFS_GATEWAY }}>
      <QueryApolloProvider>
        <RainbowProvider>
          <AppInitProvider>
            <ProjectMetadataProvider>
              <ProjectRegistryProvider>
                <SQTokenProvider>
                  <SubqlProvider theme={'light'} version="v2">
                    {children}
                  </SubqlProvider>
                </SQTokenProvider>
              </ProjectRegistryProvider>
            </ProjectMetadataProvider>
          </AppInitProvider>
        </RainbowProvider>
      </QueryApolloProvider>
    </IPFSProvider>
  );
};

const makeDebugInfo = (debugInfo: object) => {
  window.debugInfo = debugInfo;
};

const RenderRouter: React.FC = () => {
  const { address, connector, isConnected } = useAccount();
  const { signer } = useEthersSigner();
  const provider = useEthersProviderWithPublic();
  const chatboxStore = useChatBoxStore();
  const setChatBoxRef = useCallback((ref: ChatBoxRef) => {
    chatboxStore.setChatBoxRef(ref as ChatBoxRef);
  }, []);

  useEffect(() => {
    (async () => {
      makeDebugInfo({
        address,
        walletName: connector?.name,
        signerAddress: 'not collected',
        signerChainId: 'not collected',
        providerNetwork: provider.network?.name,
        isConnected: isConnected,
      });
      const signerAddress = await signer?.getAddress();
      const signerChainId = await signer?.getChainId();
      const providerNetwork = await provider.getNetwork();

      makeDebugInfo({
        address,
        walletName: connector?.name,
        signerAddress,
        signerChainId,
        providerNetwork,
        isConnected: isConnected,
      });
    })();
  }, [address, connector, signer, provider]);

  return (
    <>
      <BrowserRouter>
        <div className="Main">
          <div className="Header">
            <Header />
          </div>
          <AlertBanner center></AlertBanner>
          <div className="Content">
            <ChainStatus>
              <RouterComponent></RouterComponent>
            </ChainStatus>
          </div>
        </div>
      </BrowserRouter>

      <ChatBox
        ref={setChatBoxRef}
        chatUrl={import.meta.env.VITE_AI_URL}
        prompt={address ? `My address is: ${address},use this for any further prompts.` : undefined}
        onReaction={async (status, message, userQuestion) => {
          await fetch(`${import.meta.env.VITE_AI_REACTION_URL}/react/message`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              status: status,
              conversation_id: message.conversation_id,
              id: message.id,
              content: message.content as string,
              user_question: userQuestion.content,
            }),
          });
        }}
      ></ChatBox>
    </>
  );
};

export const App: React.FC = () => {
  return (
    <Providers>
      <div className="App">
        <RenderRouter />
      </div>
    </Providers>
  );
};
