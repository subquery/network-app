// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, gql } from '@apollo/client';
import * as React from 'react';

export interface Project {
  id: string;
  owner: string;
  metadata: string;
  currentDeployment: string;
  currentVersion: string;

  updatedAt: Date;
  createdAt: Date;
}

export interface ProjectDeployment {
  deployment: Deployment;
}

export interface Deployment {
  id: string;
  version: string;

  createdAt: Date;
}

export interface DeploymentIndexer {
  id: string;
  indexer: string;
  deploymentId: string;
  blockHeight: BigInt | string;
  status: 'indexing' | 'ready' | 'terminated';
  createdAt: Date;
  updatedAt: Date;
}

const GET_PROJECT = gql`
  query GetProject($id: String!) {
    project(id: $id) {
      id
      owner
      metadata
      currentVersion
      currentDeployment
      updatedAt
      createdAt
    }
  }
`;

const GET_PROJECTS = gql`
  query GetProjects($offset: Int) {
    projects(first: 10, offset: $offset) {
      nodes {
        id
        owner
        metadata
        currentVersion
        currentDeployment
        updatedAt
        createdAt
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
          createdAt
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
        createdAt
        updatedAt
      }
    }
  }
`;

type ProjectQueryVars = { id: string };
type ProjectQueryData = { project: Project };
export function useProjectQuery(params: ProjectQueryVars) {
  return useQuery<ProjectQueryData, ProjectQueryVars>(GET_PROJECT, { variables: params });
}

type ProjectsQueryVars = { offset?: number };
type ProjectsQueryData = { projects: { nodes: Project[] } };
export function useProjectsQuery(params: ProjectsQueryVars) {
  // Set defaults
  params = { offset: 0, ...params };
  return useQuery<ProjectsQueryData, ProjectsQueryVars>(GET_PROJECTS, { variables: params });
}

type DeploymentsQueryVars = { projectId: string };
type DeploymentsQueryData = { projectDeployments: { nodes: ProjectDeployment[] } };
export function useDeploymentsQuery(params: DeploymentsQueryVars) {
  return useQuery<DeploymentsQueryData, DeploymentsQueryVars>(GET_PROJECT_DEPLOYMENTS, { variables: params });
}

type IndexersQueryVars = { deploymentId?: string };
type IndexersQueryData = { indexers: { nodes: DeploymentIndexer[] } };
export function useIndexersQuery(params: IndexersQueryVars) {
  return useQuery<IndexersQueryData, IndexersQueryVars>(GET_DEPLOYMENT_INDEXERS, { variables: params });
}

export const QueryRegistryProjectProvider: React.FC<{ endpoint?: string }> = (props) => {
  const client = React.useMemo(() => {
    if (!props?.endpoint) {
      throw new Error('Query Registry Project endpoint not provided');
    }
    return new ApolloClient({
      uri: props.endpoint,
      cache: new InMemoryCache(),
    });
  }, [props?.endpoint]);

  return <ApolloProvider client={client}>{props.children}</ApolloProvider>;
};
