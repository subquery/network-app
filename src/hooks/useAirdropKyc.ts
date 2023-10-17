// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_AIRDROP_DOMAIN,
});

export const useAirdropKyc = () => {
  const getKycStatus = async (account: string) => {
    try {
      const res = await instance.get<{ status: boolean; reason: string }>(`/kyc/status/${account}`);

      if (res.data?.status) {
        return true;
      }

      return false;
    } catch (e) {
      return false;
    }
  };

  return {
    getKycStatus,
  };
};
