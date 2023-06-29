// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import {
  ApolloClient,
  ApolloProvider,
  FieldPolicy,
  gql,
  InMemoryCache,
  QueryResult,
  QueryTuple,
  useLazyQuery,
  useQuery,
} from '@apollo/client';

import { GetAcceptedOffers, GetAcceptedOffersVariables } from '../__generated__/registry/GetAcceptedOffers';
import { GetDeployment, GetDeploymentVariables } from '../__generated__/registry/GetDeployment';
import { GetDeploymentIndexer, GetDeploymentIndexerVariables } from '../__generated__/registry/GetDeploymentIndexer';
import { GetDeploymentIndexers, GetDeploymentIndexersVariables } from '../__generated__/registry/GetDeploymentIndexers';
import {
  GetDeploymentIndexersByIndexer,
  GetDeploymentIndexersByIndexerVariables,
} from '../__generated__/registry/GetDeploymentIndexersByIndexer';
import { GetDeploymentPlans, GetDeploymentPlansVariables } from '../__generated__/registry/GetDeploymentPlans';
import { GetProject, GetProjectVariables } from '../__generated__/registry/GetProject';
import { GetProjectDeployments, GetProjectDeploymentsVariables } from '../__generated__/registry/GetProjectDeployments';
import { GetProjects, GetProjectsVariables } from '../__generated__/registry/GetProjects';
import { PLAN_FIELDS, PLAN_TEMPLATE_FIELDS } from './IndexerRegistryProject';

const PROJECT_FIELDS = gql`
  fragment ProjectFields on Project {
    id
    owner
    metadata
    currentVersion
    currentDeployment
    updatedTimestamp
    createdTimestamp
  }
`;

const GET_PROJECT = gql`
  ${PROJECT_FIELDS}
  query GetProject($id: String!) {
    project(id: $id) {
      ...ProjectFields
    }
  }
`;

const GET_PROJECTS = gql`
  ${PROJECT_FIELDS}
  query GetProjects($offset: Int) {
    projects(first: 10, offset: $offset) {
      nodes {
        ...ProjectFields
      }
    }
  }
`;

const GET_DEPLOYMENT = gql`
  query GetDeployment($deploymentId: String!) {
    deployment(id: $deploymentId) {
      id
      version
      project {
        id
        metadata
      }
    }
  }
`;

const GET_PROJECT_DEPLOYMENTS = gql`
  query GetProjectDeployments($projectId: String!) {
    project(id: $projectId) {
      deployments {
        nodes {
          id
          version
          createdTimestamp
        }
      }
    }
  }
`;

const DEPLOYMENT_INDEXER_FIELDS = gql`
  fragment DeploymentIndexerFields on DeploymentIndexer {
    id
    indexerId
    deploymentId
    blockHeight
    timestamp
    status
    indexer {
      metadata
    }
  }
`;

const GET_DEPLOYMENT_INDEXERS = gql`
  ${DEPLOYMENT_INDEXER_FIELDS}
  query GetDeploymentIndexers($offset: Int, $deploymentId: String!) {
    deploymentIndexers(
      first: 20
      offset: $offset
      filter: { deploymentId: { equalTo: $deploymentId }, status: { notEqualTo: TERMINATED } }
    ) {
      totalCount
      nodes {
        ...DeploymentIndexerFields
      }
    }
  }
`;

const GET_DEPLOYMENT_INDEXER = gql`
  ${DEPLOYMENT_INDEXER_FIELDS}
  query GetDeploymentIndexer($indexerAddress: String!, $deploymentId: String!) {
    deploymentIndexers(filter: { indexerId: { equalTo: $indexerAddress }, deploymentId: { equalTo: $deploymentId } }) {
      nodes {
        ...DeploymentIndexerFields
      }
    }
  }
`;

const GET_DEPLOYMENT_INDEXERS_WITH_INDEXER = gql`
  ${DEPLOYMENT_INDEXER_FIELDS}
  query GetDeploymentIndexersByIndexer($indexerAddress: String!) {
    deploymentIndexers(filter: { indexerId: { equalTo: $indexerAddress } }) {
      nodes {
        ...DeploymentIndexerFields
        deployment {
          id
          project {
            id
            metadata
          }
        }
      }
    }
  }
`;

const GET_DEPLOYMENT_PLANS = gql`
  ${PLAN_TEMPLATE_FIELDS}
  ${PLAN_FIELDS}
  query GetDeploymentPlans($address: String!, $deploymentId: String!) {
    plans(
      filter: {
        creator: { equalTo: $address }
        and: [
          { active: { equalTo: true } }
          { or: [{ deploymentId: { isNull: true } }, { deploymentId: { equalTo: $deploymentId } }] }
        ]
      }
    ) {
      nodes {
        ...PlanFields
        planTemplate {
          ...PlanTemplateFields
        }
      }
    }
  }
`;

const GET_ACCEPTED_OFFERS = gql`
  query GetAcceptedOffers($address: String!, $offerId: String!) {
    acceptedOffers(filter: { indexerId: { equalTo: $address }, offerId: { equalTo: $offerId } }) {
      nodes {
        id
      }
    }
  }
`;

export function useProjectQuery(params: GetProjectVariables): QueryResult<GetProject, GetProjectVariables> {
  return useQuery<GetProject, GetProjectVariables>(GET_PROJECT, { variables: params });
}

export function useProjectsQuery(params: GetProjectsVariables): QueryResult<GetProjects> {
  // Set defaults
  params = { offset: 0, ...params };
  return useQuery<GetProjects, GetProjectsVariables>(GET_PROJECTS, { variables: params });
}

export function useDeploymentQuery(params: GetDeploymentVariables): QueryResult<GetDeployment, GetDeploymentVariables> {
  return useQuery<GetDeployment, GetDeploymentVariables>(GET_DEPLOYMENT, {
    variables: params,
  });
}

export function useDeploymentsQuery(
  params: GetProjectDeploymentsVariables,
): QueryResult<GetProjectDeployments, GetProjectDeploymentsVariables> {
  return useQuery<GetProjectDeployments, GetProjectDeploymentsVariables>(GET_PROJECT_DEPLOYMENTS, {
    variables: params,
  });
}

export function useAcceptedOffersQuery(
  params?: GetAcceptedOffersVariables,
): QueryResult<GetAcceptedOffers, GetAcceptedOffersVariables> {
  return useQuery<GetAcceptedOffers, GetAcceptedOffersVariables>(GET_ACCEPTED_OFFERS, {
    variables: params,
  });
}

export function useDeploymentIndexerQuery(
  params?: GetDeploymentIndexerVariables,
): QueryResult<GetDeploymentIndexer, GetDeploymentIndexerVariables> {
  return useQuery<GetDeploymentIndexer, GetDeploymentIndexerVariables>(GET_DEPLOYMENT_INDEXER, {
    variables: params,
  });
}

export function useIndexerDeploymentsQuery(
  params?: GetDeploymentIndexersByIndexerVariables,
): QueryResult<GetDeploymentIndexersByIndexer, GetDeploymentIndexersByIndexerVariables> {
  return useQuery<GetDeploymentIndexersByIndexer, GetDeploymentIndexersByIndexerVariables>(
    GET_DEPLOYMENT_INDEXERS_WITH_INDEXER,
    {
      variables: params,
    },
  );
}

export function useDeploymentPlansLazy(
  params?: GetDeploymentPlansVariables,
): QueryTuple<GetDeploymentPlans, GetDeploymentPlansVariables> {
  return useLazyQuery<GetDeploymentPlans, GetDeploymentPlansVariables>(GET_DEPLOYMENT_PLANS, {
    variables: params,
  });
}

// Same as offsetLimitPagination but uses variables to get the offset
function subqlOffsetPagination<T>(keyArgs?: string[] | false): FieldPolicy<T[], T[], T[]> {
  if (!keyArgs) keyArgs = false;

  return {
    keyArgs,
    merge: (existing, incoming, args) => {
      const merged = existing ? existing.slice(0) : [];

      for (let i = 0; i < incoming.length; ++i) {
        merged[(args.variables?.offset ?? 0) + i] = incoming[i];
      }

      return merged;
    },
  };
}

export const QueryRegistryProjectProvider: React.FC<{ endpoint?: string; children: React.ReactNode }> = (props) => {
  const client = React.useMemo(() => {
    if (!props?.endpoint) {
      throw new Error('Query Registry Project endpoint not provided');
    }
    return new ApolloClient({
      uri: props.endpoint,
      cache: new InMemoryCache({
        typePolicies: {
          IndexersConnection: {
            keyFields: [],
            fields: {
              nodes: subqlOffsetPagination(),
            },
          },
        },
      }),
    });
  }, [props?.endpoint]);

  return <ApolloProvider client={client}>{props.children}</ApolloProvider>;
};
