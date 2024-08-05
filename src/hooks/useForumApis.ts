// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_FORUM_DOMAIN,
});

export const useForumApis = () => {
  const getLatestApi = async () => {
    const res = await instance.get<IGetLatestTopics>('/c/subquery-mainnet/17/l/latest.json', {
      params: {
        filter: 'default',
        ascending: 'false',
      },
    });

    if (res.status === 200) {
      return res.data.topic_list.topics;
    }

    return [];
  };

  return {
    getLatestApi,
  };
};

export interface IGetLatestTopics {
  topic_list: {
    topics: {
      last_posted_at: string;
      created_at: string;

      title: string;
      slug: string;
    }[];
  };
}
