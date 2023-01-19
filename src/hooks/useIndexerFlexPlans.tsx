// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AsyncData } from '../utils';
import { useAsyncMemo } from './useAsyncMemo';

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
}

export function useIndexerFlexPlans(projectId: string): AsyncData<Array<IIndexerFlexPlan>> {
  const projectUrl = `${process.env.REACT_APP_CONSUMER_HOST_ENDPOINT}/projects/${projectId}`;

  return useAsyncMemo(async () => {
    const rawRes = await fetch(projectUrl);
    const result = await rawRes.json();

    return result?.indexers ?? [];
  }, [projectId]);
}
