// Copyright 2020-2022 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useQuery, gql, QueryResult } from '@apollo/client';
import { GetDelegations, GetDelegationsVariables } from '../__generated__/GetDelegations';
import { GetIndexer, GetIndexerVariables } from '../__generated__/GetIndexer';
import { GetIndexerDelegators, GetIndexerDelegatorsVariables } from '../__generated__/GetIndexerDelegators';
import { GetIndexers, GetIndexersVariables } from '../__generated__/GetIndexers';

const INDEXER_FIELDS = gql`
  fragment IndexerFields on Indexer {
    id
    metadata
    controller
    commission
    totalStake
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
  query GetIndexers($offset: Int) {
    indexers(first: 10, offset: $offset) {
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
