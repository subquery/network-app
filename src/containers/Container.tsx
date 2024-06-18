// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

const EMPTY: unique symbol = Symbol();

export class Logger {
  constructor(private readonly prefix: string = '') {}

  getLogger(scope: string): Logger {
    return new Logger(`${this.prefix}[${scope}]`);
  }

  public l(message: any, ...rest: any[]): void {
    console.log(`${this.prefix}${message?.toString()}`, ...rest);
  }

  public w(message: any, ...rest: any[]): void {
    console.warn(`${this.prefix}${message?.toString()}`, ...rest);
  }

  public e(message: any, ...rest: any[]): void {
    console.error(`${this.prefix}${message?.toString()}`, ...rest);
  }
}

export type Props<State = void> = {
  initialState?: State;
  children?: React.ReactNode;
};

export type Container<V, State = void> = {
  Provider: React.ComponentType<Props<State>>;
  useContainer: () => V;
};

const logger = new Logger();

export function createContainer<V, State = void>(
  useHook: (logger: Logger, initialState?: State) => V,
  options?: { displayName?: string },
): Container<V, State> {
  const Ctx = React.createContext<V | typeof EMPTY>(EMPTY);

  if (options?.displayName) {
    Ctx.displayName = options.displayName;
  }

  function Provider(props: Props<State>) {
    const l = React.useMemo(() => (options?.displayName ? logger.getLogger(options.displayName) : logger), []);
    const value = useHook(l, props.initialState);
    return <Ctx.Provider value={value}>{props.children}</Ctx.Provider>;
  }

  function useContainer(): V {
    const value = React.useContext(Ctx);

    if (value === EMPTY) {
      throw new Error(`Component must be wrapped with <${Ctx.displayName ?? 'Container'}.Provider>`);
    }

    return value;
  }

  return {
    Provider,
    useContainer,
  };
}
