// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AsyncData } from '../utils';
import { useAsyncMemo } from './useAsyncMemo';

export interface IIndexerFlexPlans {
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
}

export function useIndexerFlexPlans(projectId: string): AsyncData<Array<IIndexerFlexPlans>> {
  const projectUrl = `${process.env.REACT_APP_CONSUMER_HOST_PROJECT}/${projectId}`;

  return useAsyncMemo(async () => {
    const rawRes = await fetch(projectUrl);
    const result = await rawRes.json();

    return result?.indexers ?? [];
  }, [projectId]);
}
