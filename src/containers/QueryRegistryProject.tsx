// Copyright 2020-2022 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, gql, QueryResult } from '@apollo/client';
import { offsetLimitPagination } from '@apollo/client/utilities';
import * as React from 'react';
import { GetDeployment, GetDeploymentVariables } from '../__generated__/GetDeployment';
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
      version
      id
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
          createdTimestamp
        }
      }
    }
  }
`;

const GET_DEPLOYMENT_INDEXERS = gql`
  query GetDeploymentIndexers($deploymentId: String!) {
    deploymentIndexers(filter: { deploymentId: { equalTo: $deploymentId } }) {
      nodes {
        id
        indexerAddress
        deploymentId
        blockHeight
        timestamp
        status
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

export function useDeploymentQuery(params: GetDeploymentVariables): QueryResult<GetDeployment> {
  return useQuery<GetDeployment, GetDeploymentVariables>(GET_DEPLOYMENT, {
    variables: params,
  });
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
