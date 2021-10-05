import { createContainer, Logger } from './Container';
import React from 'react';
import { create, IPFSHTTPClient } from 'ipfs-http-client';

type InitialState = {
  gateway: string;
};

function useIPFSImpl(logger: Logger, { gateway }: InitialState): IPFSHTTPClient {
  const ipfs = React.useRef<IPFSHTTPClient>(create({ url: gateway }));

  React.useEffect(() => {
    logger.l(`Creating ipfs client at: ${gateway}`);
    ipfs.current = create({ url: gateway });
  }, [gateway, logger]);

  return ipfs.current;
}

export const { useContainer: useIPFS, Provider: IPFSProvider } = createContainer(useIPFSImpl, { displayName: 'IPFS' });
