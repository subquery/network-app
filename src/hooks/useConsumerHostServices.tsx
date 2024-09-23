// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0
import React, { useCallback } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useAccount } from '@containers/Web3';
import { Modal, openNotification, Typography } from '@subql/components';
import { getAuthReqHeader, parseError, POST } from '@utils';
import { limitContract, makeCacheKey } from '@utils/limitation';
import { waitForSomething } from '@utils/waitForSomething';
import { Button } from 'antd';
import axios, { AxiosResponse } from 'axios';
import { BigNumberish } from 'ethers';
import { isObject } from 'lodash-es';
import { generateNonce, SiweMessage } from 'siwe';
import { useChainId, useSignMessage } from 'wagmi';

const instance = axios.create({
  baseURL: import.meta.env.VITE_CONSUMER_HOST_ENDPOINT,
});

export const isConsumerHostError = (res: object): res is ConsumerHostError => {
  if (!isObject(res)) return false;
  return Object.hasOwn(res, 'error');
};

// Will add more controller along with below TODO
export type ConsumerHostServicesProps = {
  alert?: boolean;
  autoLogin?: boolean;
};

export enum LOGIN_CONSUMER_HOST_STATUS_MSG {
  USE_CACHE = 'use cache',
  OK = 'ok',
  REJECT_SIGN = 'User denied message signature',
}

// TODO: add cache for api request
export const useConsumerHostServices = (
  { alert = false, autoLogin = true }: ConsumerHostServicesProps = { alert: false, autoLogin: true },
) => {
  const { address: account } = useAccount();
  const chainId = useChainId();
  const { signMessageAsync } = useSignMessage();

  const authHeaders = useRef<{ Authorization: string }>(
    getAuthReqHeader(localStorage.getItem(`consumer-host-services-token-${account}`) || ''),
  );
  const [hasLogin, setHasLogin] = useState(false);
  const [loading, setLoading] = useState(true);

  const requestConsumerHostToken = async (account: string) => {
    try {
      const tokenRequestUrl = `${import.meta.env.VITE_CONSUMER_HOST_ENDPOINT}/login`;

      const newMsg = new SiweMessage({
        domain: window.location.host,
        address: account,
        statement: `Login to SubQuery Network`,
        uri: window.location.origin,
        version: '1',
        chainId,
        nonce: generateNonce(),
      });

      const signature = await signMessageAsync({
        message: newMsg.prepareMessage(),
      });

      if (!signature) throw new Error();

      const { response, error } = await POST({
        endpoint: tokenRequestUrl,
        requestBody: {
          message: newMsg.prepareMessage(),
          signature: signature,
        },
      });

      const sortedResponse = response && (await response.json());

      if (error || !response?.ok || sortedResponse?.error) {
        throw new Error(sortedResponse?.error ?? error);
      }
      return { data: sortedResponse?.token };
    } catch (error) {
      return {
        error: parseError(error, {
          defaultGeneralMsg: 'Failed to request token of consumer host.',
          errorMappings: [
            {
              error: 'Missing consumer',
              message: 'Please deposit first',
            },
          ],
        }),
      };
    }
  };

  const alertResDecorator = <T extends (...args: any) => any>(
    func: T,
  ): ((...args: Parameters<T>) => Promise<ReturnType<T>>) => {
    return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
      const res = await func(...args);

      if (alert && isConsumerHostError(res.data)) {
        openNotification({
          type: 'error',
          description: res.data.error,
          duration: 5000,
        });
      }

      return res;
    };
  };

  const loginConsumerHost = async (refresh = false) => {
    if (account) {
      if (!refresh) {
        const cachedToken = localStorage.getItem(`consumer-host-services-token-${account}`);
        if (cachedToken) {
          authHeaders.current = getAuthReqHeader(cachedToken);
          return {
            status: true,
            msg: 'use cache',
          };
        }
      }

      let acceptOrCancel: 'pending' | 'cancel' | 'pass' = 'pending';
      Modal.confirm({
        title: 'Login to SubQuery Network',
        width: 572,
        content: (
          <Typography>
            <p>You must sign a request using your wallet to login to SubQuery</p>
            <p>
              This is only required once for each browser and does not cost any transaction fees - it is used to prove
              you have access to your wallet address.
            </p>
          </Typography>
        ),
        cancelText: 'Cancel',
        className: 'confirmModal',
        okText: 'Sign Request using Wallet',
        cancelButtonProps: {
          shape: 'round',
          size: 'large',
        },
        okButtonProps: {
          shape: 'round',
          size: 'large',
          type: 'primary',
        },
        icon: null,
        onOk: () => {
          acceptOrCancel = 'pass';
        },
        onCancel: () => {
          acceptOrCancel = 'cancel';
        },
      });

      await waitForSomething({ func: () => acceptOrCancel !== 'pending' });
      // https://github.com/microsoft/TypeScript/issues/9998
      const isCancel = (res: typeof acceptOrCancel): res is 'cancel' => res === 'cancel';
      if (isCancel(acceptOrCancel)) {
        return {
          status: false,
          msg: 'user reject sign',
        };
      }

      const res = await requestConsumerHostToken(account);

      if (res.error) {
        return {
          status: false,
          msg: res.error,
        };
      }

      if (res.data) {
        authHeaders.current = getAuthReqHeader(res.data);
        localStorage.setItem(`consumer-host-services-token-${account}`, res.data);
        setHasLogin(true);
        return {
          status: true,
          msg: 'ok',
        };
      }
    }

    return {
      status: false,
      msg: 'Please check your wallet if works',
    };
  };

  // do not need retry limitation
  // login need user confirm sign, so it's a block operation
  const checkLoginStatusAndLogin = async (res: unknown[] | object): Promise<boolean> => {
    if (isConsumerHostError(res) && `${res.code}` === '403') {
      const loginStatus = await loginConsumerHost(true);
      if (loginStatus.status) {
        return true;
      }
    } else {
      setHasLogin(true);
    }

    return false;
  };

  const checkIfHasLogin = async () => {
    // this api do not need arguements. so use it to check if need login.
    try {
      setLoading(true);
      authHeaders.current = getAuthReqHeader(localStorage.getItem(`consumer-host-services-token-${account}`) || '');
      const res = await limitContract(() => getUserApiKeysApi(), makeCacheKey('checkIfHasLogin', { prefix: account }));
      if (isConsumerHostError(res.data) && `${res.data.code}` === '403') {
        setHasLogin(false);
        return;
      }
      setHasLogin(true);
    } finally {
      setLoading(false);
    }
  };

  const loginResDecorator = <T extends (...args: any) => any>(
    func: T,
  ): ((...args: Parameters<T>) => Promise<ReturnType<T>>) => {
    return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
      const res = await func(...args);
      const sdLogin = await checkLoginStatusAndLogin(res.data);

      if (sdLogin) return await func(...args);

      return res;
    };
  };

  // the apis can use useCallback to speed up for re-render. if necessary
  const getUserApiKeysApi = useCallback(async (): Promise<AxiosResponse<GetUserApiKeys[] | ConsumerHostError>> => {
    const res = await instance.get<GetUserApiKeys[] | ConsumerHostError>('/users/apikeys', {
      headers: authHeaders.current,
    });

    return res;
  }, []);

  const createNewApiKey = useCallback(
    async (params: { name: string }): Promise<AxiosResponse<GetUserApiKeys | ConsumerHostError, { name: string }>> => {
      const res = await instance.post<GetUserApiKeys>('/users/apikeys/new', params, {
        headers: authHeaders.current,
      });

      return res;
    },
    [],
  );

  const deleteNewApiKey = useCallback(async (apikeyId: number) => {
    const res = await instance.post<GetUserApiKeys>(
      `/users/apikeys/${apikeyId}/delete`,
      {},
      {
        headers: authHeaders.current,
      },
    );

    return res;
  }, []);

  const createHostingPlanApi = useCallback(
    async (params: IPostHostingPlansParams): Promise<AxiosResponse<IGetHostingPlans>> => {
      const res = await instance.post<IGetHostingPlans>(`/users/hosting-plans`, params, {
        headers: authHeaders.current,
      });

      return res;
    },
    [],
  );

  const updateHostingPlanApi = useCallback(
    async (params: IPostHostingPlansParams & { id: string | number }): Promise<AxiosResponse<IGetHostingPlans>> => {
      const res = await instance.post<IGetHostingPlans>(`/users/hosting-plans/${params.id}`, params, {
        headers: authHeaders.current,
      });

      return res;
    },
    [],
  );

  const getHostingPlanApi = useCallback(
    async (params: { account?: string }): Promise<AxiosResponse<IGetHostingPlans[]>> => {
      const res = await instance.get<IGetHostingPlans[]>(`/hosting-plans/${params.account}`, {
        headers: authHeaders.current,
      });

      return res;
    },
    [],
  );

  const getProjects = useCallback(async (params: { projectId: string; deployment?: string }) => {
    const res = await instance.get<{ indexers: IIndexerFlexPlan[] }>(`/projects/${params.projectId}`, {
      headers: authHeaders.current,
      params,
    });

    return res;
  }, []);

  const getUserChannelState = useCallback(async (channelId: string): Promise<AxiosResponse<IGetUserChannelState>> => {
    const res = await instance.get<IGetUserChannelState>(`/users/channels/${channelId}/state`, {
      headers: authHeaders.current,
    });

    return res;
  }, []);

  const getChannelLimit = useCallback(async () => {
    const res = await instance.get<IGetChannelLimit>('/channel-limit', {
      headers: authHeaders.current,
    });

    return res;
  }, []);

  const getChannelSpent = useCallback(async (params: { consumer: string; channel?: string }) => {
    const res = await instance.get<IGetChannelSpent>('/channel-spent', {
      headers: authHeaders.current,
      params,
    });

    return res;
  }, []);

  const refreshUserInfo = useCallback(async () => {
    const res = await instance.get('/users/refresh', {
      headers: authHeaders.current,
    });

    return res;
  }, []);

  const getSpentInfo = useCallback(async (params: { account: string; start?: string; end?: string }) => {
    const res = await instance.get<IGetSpentInfo>(`/aggregation/${params.account}`, {
      headers: authHeaders.current,
      params,
    });

    return res;
  }, []);

  const getStatisticQueries = useCallback(
    async (params: { deployment: string[]; indexer?: string[]; start_date: string; end_date?: string }) => {
      const res = await instance.post<IGetStatisticQueries>(`/statistic-queries`, params, {
        headers: authHeaders.current,
      });

      return res;
    },
    [],
  );

  const getStatisticQueriesByPrice = useCallback(
    async (params: { start_date: string; end_date?: string; deployment: string[] }) => {
      const res = await instance.post<IGetStatisticQueriesByPrice>(`/deployment-price-count`, params, {
        headers: authHeaders.current,
      });

      return res;
    },
    [],
  );

  const getUserQueriesAggregation = useCallback(
    async (params: { start_date: string; end_date?: string; user_list: string[] }) => {
      const res = await instance.post<IGetStatisticUserQueries>(`/multi_user_aggregation`, params, {
        headers: authHeaders.current,
      });

      return res;
    },
    [],
  );

  const requestTokenLayout = useCallback(
    (pageTitle: string) => {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h5" weight={500}>
            Session Token
          </Typography>

          <Typography
            style={{ color: 'var(--sq-gray700)', marginTop: 16, marginBottom: 40, width: 344, textAlign: 'center' }}
          >
            To access {pageTitle}, you need to request a session token.
          </Typography>

          <Button
            shape="round"
            type="primary"
            style={{ background: 'var(--sq-blue600)', borderColor: 'var(--sq-blue600)' }}
            onClick={async () => {
              const res = await loginConsumerHost(true);
              if (!res.status) {
                openNotification({
                  type: 'error',
                  title: 'Login failed',
                  description: res.msg,
                });
              }
            }}
          >
            Request Session token
          </Button>
        </div>
      );
    },
    [loginConsumerHost],
  );

  useEffect(() => {
    checkIfHasLogin();
    if (autoLogin) {
      loginConsumerHost();
    }
  }, [account, autoLogin]);

  return {
    getUserApiKeysApi: alertResDecorator(loginResDecorator(getUserApiKeysApi)),
    createNewApiKey: alertResDecorator(loginResDecorator(createNewApiKey)),
    deleteNewApiKey: alertResDecorator(loginResDecorator(deleteNewApiKey)),
    createHostingPlanApi: alertResDecorator(loginResDecorator(createHostingPlanApi)),
    updateHostingPlanApi: alertResDecorator(loginResDecorator(updateHostingPlanApi)),
    getUserChannelState: alertResDecorator(loginResDecorator(getUserChannelState)),
    getProjects: alertResDecorator(getProjects),
    refreshUserInfo: loginResDecorator(refreshUserInfo),
    getStatisticQueries: alertResDecorator(getStatisticQueries),
    getStatisticQueriesByPrice: alertResDecorator(getStatisticQueriesByPrice),
    getUserQueriesAggregation: alertResDecorator(getUserQueriesAggregation),
    getSpentInfo,
    getHostingPlanApi,
    getChannelLimit,
    requestConsumerHostToken,
    checkIfHasLogin,
    loginConsumerHost,
    requestTokenLayout,
    getChannelSpent,

    hasLogin,
    loading,
  };
};

export type IGetStatisticUserQueries = {
  info: {
    today: string;
    total: string;
  };
  user: string;
}[];

export type IGetStatisticQueriesByPrice = {
  count?: number;
  price?: string; // per request price
}[];

export interface IGetStatisticQueries {
  total: string;
  list: {
    indexer?: string;
    list?: {
      deployment: string;
      queries: string;
    }[];

    // if no indexer at params
    deployment?: string;
    queries?: string;
  }[];
}

export interface IGetSpentInfo {
  days?: string[];
  today: string;
  total: string;
}

export interface IGetChannelSpent {
  consumer: string;
  total: string;
  spent: string;
  remain: string;
}

export interface IGetChannelLimit {
  channel_max_num: number;
  channel_min_amount: number;
  channel_min_days: number;
}

export interface IGetUserChannelState {
  channelId: string;
  consumerSign: string;
  indexerSign: string;
  isFinal: boolean;
  spent: string;
}

export interface IPostHostingPlansParams {
  deploymentId: string;
  price: BigNumberish;
  expiration: number;
  maximum: number;
}

export interface IGetHostingPlans {
  id: number;
  user_id: number;
  deployment: {
    created_at: Date;
    // cid
    deployment: string;
    id: number;
    is_actived: boolean;
    project_id: number;
    updated_at: Date;
    version: string;
    deployment_id: number;
  };
  project: {
    metadata: string;
    id: number;
  };
  channels: string;
  maximum: number;
  price: BigNumberish;
  spent: string;
  expired_at: string;
  is_actived: true;
  created_at: string;
  updated_at: string;
}

export interface GetUserApiKeys {
  id: number;
  user_id: number;
  name: string;
  value: string;
  times: number;
  created_at: string;
  updated_at: string;
}

export interface IIndexerFlexPlan {
  id: number;
  deployment_id: number;
  indexer_id: number;
  indexer: string;
  price: string;
  max_time: number;
  block_height: string;
  status: number;
  status_at: Date;
  score: number;
  reality: number;
  is_active: boolean;
  create_at: Date;
  updated_at: Date;
  online: boolean;
  price_token: string;
}

export type ConsumerHostError =
  | {
      code: '2000';
      error: 'Invalid: json parse error.';
    }
  | {
      code: '2001';
      error: 'Invalid: invalid fund amount.';
    }
  | {
      code: '2002';
      error: 'Invalid: invalid callback signature decode.';
    }
  | {
      code: '2003';
      error: 'Invalid: invalid callback signature length.';
    }
  | {
      code: '2004';
      error: 'Invalid: channel not expired.';
    }
  | {
      code: '2005';
      error: 'Invalid: send query channel failure.';
    }
  | {
      code: '2006';
      error: 'Invalid: invalid deployment and indexer.';
    }
  | {
      code: '2007';
      error: 'Invalid: invalid expiration time.';
    }
  | {
      code: '2008';
      error: 'Invalid: invalid total amount.';
    }
  | {
      code: '2009';
      error: 'Invalid: user balance in contract is not enough.';
    }
  | {
      code: '2010';
      error: 'Invalid: send open channel failure.';
    }
  | {
      code: '2011';
      error: 'Invalid: invalid ApiKey when remove.';
    }
  | {
      code: '2012';
      error: 'Invalid: price is too small.';
    }
  | {
      code: '2013';
      error: 'Invalid: hosting plan maximum too small, need >= 2.';
    }
  | {
      code: '2014';
      error: 'Invalid: user missing in contract.';
    }
  | {
      code: '2020';
      error: 'Forbidden: admin not super admin.';
    }
  | {
      code: '2021';
      error: 'Forbidden: user not approved.';
    }
  | {
      code: '2022';
      error: 'Forbidden: channel not actived.';
    }
  | {
      code: '2023';
      error: 'Forbidden: user not actived.';
    }
  | {
      code: '2030';
      error: 'Offline: indexer offline.';
    }
  | {
      code: '2050';
      error: 'Internal: db (sqlx) error.';
    }
  | {
      code: '2051';
      error: 'Internal: template (tera) error.';
    }
  | {
      code: '2052';
      error: 'Internal: null response.';
    }
  | {
      code: '2053';
      error: 'Internal: contract address and ABI error.';
    }
  | {
      code: '2054';
      error: 'Internal: app handle static file error.';
    }
  | {
      code: '2055';
      error: 'Internal: app from request parts SessionHandle error.';
    }
  | {
      code: '2056';
      error: 'Internal: app from request parts AppContext error.';
    }
  | {
      code: '2057';
      error: 'Internal: app from request parts Cookie error.';
    }
  | {
      code: '2058';
      error: 'Internal: argon2 hash password error.';
    }
  | {
      code: '2059';
      error: 'Internal: parse chain height to u64 error.';
    }
  | {
      code: '2060';
      error: 'Not found: indexer model.';
    }
  | {
      code: '2061';
      error: 'Not found: admin model.';
    }
  | {
      code: '2062';
      error: 'Not found: apikey model.';
    }
  | {
      code: '2063';
      error: 'Not found: deployment model.';
    }
  | {
      code: '2064';
      error: 'Not found: deployment indexer model.';
    }
  | {
      code: '2065';
      error: 'Not found: project model.';
    }
  | {
      code: '2066';
      error: 'Not found: state channel model.';
    }
  | {
      code: '2067';
      error: 'Not found: user model.';
    }
  | {
      code: '2068';
      error: 'Not found: hosting plan model.';
    }
  | {
      code: '2069';
      error: 'Not found: project has no online and active indexer.';
    }
  | {
      code: '2070';
      error: 'Not found: hosting plan is expired.';
    }
  | {
      code: '2080';
      error: 'Internal: contract endpoint cannot reach.';
    }
  | {
      code: '2081';
      error: 'Internal: contract signer cannot init.';
    }
  | {
      code: '2082';
      error: 'Internal: send transaction failure. see error log.';
    }
  | {
      code: '2083';
      error: 'Internal: wait transaction failure. see error log.';
    }
  | {
      code: '2084';
      error: 'Internal: contract channel open call failure. see error log.';
    }
  | {
      code: '2085';
      error: 'Internal: contract channel fund call failure. see error log.';
    }
  | {
      code: '2086';
      error: 'Internal: contract channel finish call failure. see error log.';
    }
  | {
      code: '2087';
      error: 'Internal: contract channel claim call failure. see error log.';
    }
  | {
      code: '2088';
      error: 'Internal: contract channel terminate call failure. see error log.';
    }
  | {
      code: '2100';
      error: 'Internal: MISSING ENDPOINT HTTP';
    }
  | {
      code: '2101';
      error: 'Internal: Chain sync token contract failure';
    }
  | {
      code: '2102';
      error: 'Internal: Chain sync consumer contract serialize.';
    }
  | {
      code: '2103';
      error: 'Internal: Indexer is invalid.';
    }
  | {
      code: '403';
      error: 'not login';
    };
