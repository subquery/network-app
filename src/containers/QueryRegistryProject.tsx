// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, gql, QueryResult } from '@apollo/client';
import { offsetLimitPagination } from '@apollo/client/utilities';
import * as React from 'react';
import { GetDeploymentIndexers, GetDeploymentIndexersVariables } from '../__generated__/GetDeploymentIndexers';
import { GetProject, GetProjectVariables } from '../__generated__/GetProject';
import { GetProjectDeployments, GetProjectDeploymentsVariables } from '../__generated__/GetProjectDeployments';
import { GetProjects, GetProjectsVariables } from '../__generated__/GetProjects';

const PROJECT_FIELDS = gql`
  fragment ProjectFields on Project {
    id
    owner
    metadata
    currentVersion
    currentDeployment
    # updatedAt
    # createdAt
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

const GET_PROJECT_DEPLOYMENTS = gql`
  query GetProjectDeployments($projectId: String!) {
    projectDeployments(filter: { projectId: { equalTo: $projectId } }) {
      nodes {
        deployment {
          id
          version
          # createdAt
        }
      }
    }
  }
`;

const GET_DEPLOYMENT_INDEXERS = gql`
  query GetDeploymentIndexers($deploymentId: String!) {
    indexers(filter: { deploymentId: { equalTo: $deploymentId } }) {
      nodes {
        id
        indexer
        deploymentId
        blockHeight
        timestamp
        status
        # createdAt
        # updatedAt
      }
    }
  }
`;

export function useProjectQuery(params: GetProjectVariables): QueryResult<GetProject> {
  return useQuery<GetProject, GetProjectVariables>(GET_PROJECT, { variables: params });
}

export function useProjectsQuery(params: GetProjectsVariables): QueryResult<GetProjects> {
  // Set defaults
  params = { offset: 0, ...params };
  return useQuery<GetProjects, GetProjectsVariables>(GET_PROJECTS, { variables: params });
}

export function useDeploymentsQuery(params: GetProjectDeploymentsVariables): QueryResult<GetProjectDeployments> {
  return useQuery<GetProjectDeployments, GetProjectDeploymentsVariables>(GET_PROJECT_DEPLOYMENTS, {
    variables: params,
  });
}

export function useIndexersQuery(params?: GetDeploymentIndexersVariables): QueryResult<GetDeploymentIndexers> {
  return useQuery<GetDeploymentIndexers, GetDeploymentIndexersVariables>(GET_DEPLOYMENT_INDEXERS, {
    variables: params,
  });
}

export const QueryRegistryProjectProvider: React.FC<{ endpoint?: string }> = (props) => {
  const client = React.useMemo(() => {
    if (!props?.endpoint) {
      throw new Error('Query Registry Project endpoint not provided');
    }
    return new ApolloClient({
      uri: props.endpoint,
      cache: new InMemoryCache({
        typePolicies: {
          Query: {
            fields: {
              nodes: offsetLimitPagination(), // XXX untested
            },
          },
        },
      }),
    });
  }, [props?.endpoint]);

  return <ApolloProvider client={client}>{props.children}</ApolloProvider>;
};
