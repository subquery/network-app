// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_FORUM_DOMAIN,
});

export const useForumApis = () => {
  const getLatestApi = async () => {
    const res = await instance.get<IGetLatestTopics>('/c/kepler-network/16/l/latest.json', {
      params: {
        filter: 'default',
        ascending: 'false',
      },
    });

    if (res.status === 200) {
      return res.data.topics;
    }

    return [];
  };

  return {
    getLatestApi,
  };
};

export interface IGetLatestTopics {
  topics: {
    last_posted_at: string;
    title: string;
    slug: string;
  }[];
}
