import React, { PropsWithChildren } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppInitProvider } from '@containers/AppInitialProvider';
import { SubqlProvider } from '@subql/components';

import { RainbowProvider } from './config/rainbowConf';
import { SunsetPage } from './pages/sunset/SunsetPage';
import {
  IPFSProvider,
  ProjectMetadataProvider,
  ProjectRegistryProvider,
  QueryApolloProvider,
  SQTokenProvider,
} from './containers';

const Providers: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <IPFSProvider initialState={{ gateway: import.meta.env.VITE_IPFS_GATEWAY }}>
      <QueryApolloProvider>
        <RainbowProvider>
          <AppInitProvider>
            <ProjectMetadataProvider>
              <ProjectRegistryProvider>
                <SQTokenProvider>
                  <SubqlProvider theme="light" version="v2">
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

export const App: React.FC = () => {
  return (
    <Providers>
      <BrowserRouter>
        <SunsetPage />
      </BrowserRouter>
    </Providers>
  );
};
