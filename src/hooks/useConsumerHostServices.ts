// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useRef } from 'react';
import { useWeb3 } from '@containers';
import { openNotification } from '@subql/components';
import { getAuthReqHeader, requestConsumerHostToken } from '@utils';
import axios, { AxiosResponse } from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_CONSUMER_HOST_ENDPOINT,
});

export const isConsumerHostError = (res: object): res is ConsumerHostError => {
  return Object.hasOwn(res, 'error');
};

// Will add more controller along with below TODO
export type ConsumerHostServicesProps = {
  alert: boolean;
};

export const useConsumerHostServices = ({ alert = false }: ConsumerHostServicesProps) => {
  const { account, library } = useWeb3();
  const authHeaders = useRef<{ Authorization: string }>();

  const loginConsumerHostToken = async (refresh = false) => {
    if (account) {
      if (!refresh) {
        const cachedToken = localStorage.getItem(`consumer-host-services-token-${account}`);
        if (cachedToken) {
          authHeaders.current = getAuthReqHeader(cachedToken);
          return;
        }
      }

      const res = await requestConsumerHostToken(account, library);
      if (res.data) {
        authHeaders.current = getAuthReqHeader(res.data);
        localStorage.setItem(`consumer-host-services-token-${account}`, res.data);
      }
    }
  };

  // do not need retry limitation
  // login need user confirm sign, so it's a block operation
  const shouldLogin = async (res: unknown[] | object): Promise<boolean> => {
    if (isConsumerHostError(res) && `${res.code}` === '403') {
      await loginConsumerHostToken(true);
      return true;
    }

    return false;
  };

  // TODO: should reuse the login logic.
  // but I am not sure how to write = =.
  const getUserApiKeysApi = async (): Promise<AxiosResponse<GetUserApiKeys[] | ConsumerHostError>> => {
    const res = await instance.get<GetUserApiKeys[] | ConsumerHostError>('/users/apikeys', {
      headers: authHeaders.current,
    });

    const sdLogin = await shouldLogin(res.data);

    if (sdLogin) return await getUserApiKeysApi();

    if (alert && isConsumerHostError(res.data)) {
      openNotification({
        type: 'error',
        description: res.data.error,
        duration: 5000,
      });
    }

    return res;
  };

  const createNewApiKey = async (
    params = {},
  ): Promise<AxiosResponse<GetUserApiKeys | ConsumerHostError, { name: string }>> => {
    const res = await instance.post<GetUserApiKeys>('/users/apikeys/new', params, {
      headers: authHeaders.current,
    });

    const sdLogin = await shouldLogin(res.data);

    if (sdLogin) return await createNewApiKey(params);

    if (alert && isConsumerHostError(res.data)) {
      openNotification({
        type: 'error',
        description: res.data.error,
        duration: 5000,
      });
    }

    return res;
  };

  const deleteNewApiKey = async (apikeyId: number) => {
    const res = await instance.post<GetUserApiKeys>(
      `/users/apikeys/${apikeyId}/delete`,
      {},
      {
        headers: authHeaders.current,
      },
    );

    const sdLogin = await shouldLogin(res.data);

    if (sdLogin) return await createNewApiKey(apikeyId);

    if (alert && isConsumerHostError(res.data)) {
      openNotification({
        type: 'error',
        description: res.data.error,
        duration: 5000,
      });
    }

    return res;
  };

  useEffect(() => {
    loginConsumerHostToken();
  }, [account]);

  return {
    getUserApiKeysApi,
    createNewApiKey,
    deleteNewApiKey,
  };
};

export interface GetUserApiKeys {
  id: number;
  user_id: number;
  name: string;
  value: string;
  times: number;
  created_at: string;
  updated_at: string;
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
