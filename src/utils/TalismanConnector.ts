// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AbstractConnectorArguments, ConnectorUpdate } from '@web3-react/types';
import { AbstractConnector } from '@web3-react/abstract-connector';

export type SendReturnResult = { result: any };
export type SendReturn = any;

export type Send = (method: string, params?: any[]) => Promise<SendReturnResult | SendReturn>;
export type SendOld = ({ method }: { method: string }) => Promise<SendReturnResult | SendReturn>;

interface TalismanEthereum {
  send: unknown;
  enable: () => Promise<string[]>;
  on?: (method: string, listener: (...args: any[]) => void) => void;
  removeListener?: (method: string, listener: (...args: any[]) => void) => void;
}

export type TalismanWindow = Window &
  typeof globalThis & {
    talismanEth: TalismanEthereum;
  };

// prevents error with SSR
const talismanWindow = typeof window !== 'undefined' ? (window as TalismanWindow) : ({} as TalismanWindow);

const __DEV__ = import.meta.env.NODE_ENV !== 'production';

function parseSendReturn(sendReturn: SendReturnResult | SendReturn): any {
  return sendReturn.hasOwnProperty('result') ? sendReturn.result : sendReturn;
}

export class NoEthereumProviderError extends Error {
  public constructor() {
    super();
    this.name = this.constructor.name;
    this.message = 'No Ethereum provider was found on window.talismanEth.';
  }
}

export class UserRejectedRequestError extends Error {
  public constructor() {
    super();
    this.name = this.constructor.name;
    this.message = 'The user rejected the request.';
  }
}

export class TalismanConnector extends AbstractConnector {
  constructor(kwargs: AbstractConnectorArguments) {
    super(kwargs);

    this.handleNetworkChanged = this.handleNetworkChanged.bind(this);
    this.handleChainChanged = this.handleChainChanged.bind(this);
    this.handleAccountsChanged = this.handleAccountsChanged.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  private handleChainChanged(chainId: string | number): void {
    if (__DEV__) {
      console.log("Handling 'chainChanged' event with payload", chainId);
    }
    this.emitUpdate({ chainId, provider: talismanWindow.talismanEth });
  }

  private handleAccountsChanged(accounts: string[]): void {
    if (__DEV__) {
      console.log("Handling 'accountsChanged' event with payload", accounts);
    }
    if (accounts.length === 0) {
      this.emitDeactivate();
    } else {
      this.emitUpdate({ account: accounts[0] });
    }
  }

  private handleClose(code: number, reason: string): void {
    if (__DEV__) {
      console.log("Handling 'close' event with payload", code, reason);
    }
    this.emitDeactivate();
  }

  private handleNetworkChanged(networkId: string | number): void {
    if (__DEV__) {
      console.log("Handling 'networkChanged' event with payload", networkId);
    }
    this.emitUpdate({
      chainId: networkId,
      provider: talismanWindow.talismanEth,
    });
  }

  public async activate(): Promise<ConnectorUpdate> {
    if (!talismanWindow.talismanEth) {
      throw new NoEthereumProviderError();
    }

    if (talismanWindow.talismanEth.on) {
      talismanWindow.talismanEth.on('chainChanged', this.handleChainChanged);
      talismanWindow.talismanEth.on('accountsChanged', this.handleAccountsChanged);
      talismanWindow.talismanEth.on('close', this.handleClose);
      talismanWindow.talismanEth.on('networkChanged', this.handleNetworkChanged);
    }

    if ((talismanWindow.talismanEth as any).isMetaMask) {
      (talismanWindow.talismanEth as any).autoRefreshOnNetworkChange = false;
    }

    // try to activate + get account via eth_requestAccounts
    let account;
    try {
      account = await (talismanWindow.talismanEth.send as Send)('eth_requestAccounts').then(
        (sendReturn) => parseSendReturn(sendReturn)[0],
      );
    } catch (error) {
      if ((error as any).code === 4001) {
        throw new UserRejectedRequestError();
      }
      console.warn(false, 'eth_requestAccounts was unsuccessful, falling back to enable');
    }

    // if unsuccessful, try enable
    if (!account) {
      // if enable is successful but doesn't return accounts, fall back to getAccount (not happy i have to do this...)
      account = await talismanWindow.talismanEth
        .enable()
        .then((sendReturn) => sendReturn && parseSendReturn(sendReturn)[0]);
    }

    return {
      provider: talismanWindow.talismanEth,
      ...(account ? { account } : {}),
    };
  }

  public async getProvider(): Promise<any> {
    return talismanWindow.talismanEth;
  }

  public async getChainId(): Promise<number | string> {
    if (!talismanWindow.talismanEth) {
      throw new NoEthereumProviderError();
    }

    let chainId;
    try {
      chainId = await (talismanWindow.talismanEth.send as Send)('eth_chainId').then(parseSendReturn);
    } catch {
      console.warn(false, 'eth_chainId was unsuccessful, falling back to net_version');
    }

    if (!chainId) {
      try {
        chainId = await (talismanWindow.talismanEth.send as Send)('net_version').then(parseSendReturn);
      } catch {
        console.warn(false, 'net_version was unsuccessful, falling back to net version v2');
      }
    }

    if (!chainId) {
      try {
        chainId = parseSendReturn(
          (talismanWindow.talismanEth.send as SendOld)({
            method: 'net_version',
          }),
        );
      } catch {
        console.warn(false, 'net_version v2 was unsuccessful, falling back to manual matches and static properties');
      }
    }

    if (!chainId) {
      if ((talismanWindow.talismanEth as any).isDapper) {
        chainId = parseSendReturn((talismanWindow.talismanEth as any).cachedResults.net_version);
      } else {
        chainId =
          (talismanWindow.talismanEth as any).chainId ||
          (talismanWindow.talismanEth as any).netVersion ||
          (talismanWindow.talismanEth as any).networkVersion ||
          (talismanWindow.talismanEth as any)._chainId;
      }
    }

    return chainId;
  }

  public async getAccount(): Promise<null | string> {
    if (!talismanWindow.talismanEth) {
      throw new NoEthereumProviderError();
    }

    let account;
    try {
      account = await (talismanWindow.talismanEth.send as Send)('eth_accounts').then(
        (sendReturn) => parseSendReturn(sendReturn)[0],
      );
    } catch {
      console.warn(false, 'eth_accounts was unsuccessful, falling back to enable');
    }

    if (!account) {
      try {
        account = await talismanWindow.talismanEth.enable().then((sendReturn) => parseSendReturn(sendReturn)[0]);
      } catch {
        console.warn(false, 'enable was unsuccessful, falling back to eth_accounts v2');
      }
    }

    if (!account) {
      account = parseSendReturn((talismanWindow.talismanEth.send as SendOld)({ method: 'eth_accounts' }))[0];
    }

    return account;
  }

  public deactivate() {
    if (talismanWindow.talismanEth && talismanWindow.talismanEth.removeListener) {
      talismanWindow.talismanEth.removeListener('chainChanged', this.handleChainChanged);
      talismanWindow.talismanEth.removeListener('accountsChanged', this.handleAccountsChanged);
      talismanWindow.talismanEth.removeListener('close', this.handleClose);
      talismanWindow.talismanEth.removeListener('networkChanged', this.handleNetworkChanged);
    }
  }

  public async isAuthorized(): Promise<boolean> {
    if (!talismanWindow.talismanEth) {
      return false;
    }

    try {
      return await (talismanWindow.talismanEth.send as Send)('eth_accounts').then((sendReturn) => {
        if (parseSendReturn(sendReturn).length > 0) {
          return true;
        } else {
          return false;
        }
      });
    } catch {
      return false;
    }
  }
}
