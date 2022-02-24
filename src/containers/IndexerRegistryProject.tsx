// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useQuery, gql, QueryResult } from '@apollo/client';
import { GetDelegations, GetDelegationsVariables } from '../__generated__/GetDelegations';
import { GetIndexer, GetIndexerVariables } from '../__generated__/GetIndexer';
import { GetIndexerDelegators, GetIndexerDelegatorsVariables } from '../__generated__/GetIndexerDelegators';
import { GetIndexers, GetIndexersVariables } from '../__generated__/GetIndexers';
import { GetPlans, GetPlansVariables } from '../__generated__/GetPlans';
import { GetPlanTemplates, GetPlanTemplatesVariables } from '../__generated__/GetPlanTemplates';
import { GetWithdrawls, GetWithdrawlsVariables } from '../__generated__/GetWithdrawls';

const INDEXER_FIELDS = gql`
  fragment IndexerFields on Indexer {
    id
    metadata
    controller
    commission
    totalStake
  }
`;

const PLAN_TEMPLATE_FIELDS = gql`
  fragment PlanTemplateFields on PlanTemplate {
    id
    period
    dailyReqCap
    rateLimit
    metadata
    active
  }
`;

const GET_INDEXER = gql`
  ${INDEXER_FIELDS}
  query GetIndexer($address: String!) {
    indexer(id: $address) {
      ...IndexerFields
    }
  }
`;

const GET_INDEXERS = gql`
  ${INDEXER_FIELDS}
  query GetIndexers($offset: Int, $order: IndexersOrderBy = ID_ASC) {
    indexers(first: 10, offset: $offset, orderBy: [$order]) {
      nodes {
        ...IndexerFields
      }
    }
  }
`;

const GET_INDEXER_DELEGATORS = gql`
  query GetIndexerDelegators($id: String!, $offset: Int) {
    indexer(id: $id) {
      delegations(first: 10, offset: $offset) {
        nodes {
          delegatorAddress
          amount
        }
      }
    }
  }
`;

const GET_DELEGATIONS = gql`
  query GetDelegations($delegator: String!, $offset: Int) {
    delegations(filter: { delegatorAddress: { equalTo: $delegator } }, first: 10, offset: $offset) {
      nodes {
        id
        delegatorAddress
        indexerAddress
        amount
        indexer {
          metadata
        }
      }
    }
  }
`;

const GET_WITHDRAWLS = gql`
  query GetWithdrawls($delegator: String!, $offset: Int) {
    withdrawls(
      filter: { delegator: { equalTo: $delegator }, and: { claimed: { equalTo: false } } }
      first: 10
      offset: $offset
    ) {
      nodes {
        id
        index
        delegator
        indexer
        startTime
        amount
        claimed
      }
    }
  }
`;

const GET_PLAN_TEMPLATES = gql`
  ${PLAN_TEMPLATE_FIELDS}
  query GetPlanTemplates($offset: Int) {
    planTemplates(first: 10, offset: $offset, filter: { active: { equalTo: true } }) {
      nodes {
        ...PlanTemplateFields
      }
    }
  }
`;

const GET_PLANS = gql`
  ${PLAN_TEMPLATE_FIELDS}
  query GetPlans($address: String!) {
    plans(filter: { creator: { equalTo: $address } }) {
      nodes {
        id
        active
        creator
        deploymentId
        price
        planTemplate {
          ...PlanTemplateFields
        }
      }
    }
  }
`;

export function useIndexer(params: GetIndexerVariables): QueryResult<GetIndexer> {
  return useQuery<GetIndexer, GetIndexerVariables>(GET_INDEXER, { variables: params });
}

export function useIndexers(params: GetIndexersVariables): QueryResult<GetIndexers> {
  return useQuery<GetIndexers, GetIndexersVariables>(GET_INDEXERS, { variables: params });
}

export function useIndexerDelegators(params: GetIndexerDelegatorsVariables): QueryResult<GetIndexerDelegators> {
  return useQuery<GetIndexerDelegators, GetIndexerDelegatorsVariables>(GET_INDEXER_DELEGATORS, { variables: params });
}

export function useDelegations(params: GetDelegationsVariables): QueryResult<GetDelegations> {
  return useQuery<GetDelegations, GetDelegationsVariables>(GET_DELEGATIONS, { variables: params });
}

export function useWithdrawls(params: GetWithdrawlsVariables): QueryResult<GetWithdrawls> {
  return useQuery<GetWithdrawls, GetWithdrawlsVariables>(GET_WITHDRAWLS, { variables: params });
}

export function usePlanTemplates(params: GetPlanTemplatesVariables): QueryResult<GetPlanTemplates> {
  return useQuery<GetPlanTemplates, GetPlanTemplatesVariables>(GET_PLAN_TEMPLATES, { variables: params });
}

export function usePlans(params: GetPlansVariables): QueryResult<GetPlans> {
  return useQuery<GetPlans, GetPlansVariables>(GET_PLANS, { variables: params });
}
