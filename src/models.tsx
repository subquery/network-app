// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as yup from 'yup';

import { CIDv0 } from './utils';

export enum ProjectType {
  SUBQUERY,
  RPC,
  SQ_DICT,
  SUBGRAPH,
}

export const projectMetadataSchema = yup.object({
  name: yup.string().defined(),
  image: yup.string().optional(),
  description: yup.string().default('').optional(),
  websiteUrl: yup.string().optional().url(),
  codeUrl: yup.string().optional().url(),
  versionDescription: yup.string().default('').optional(),
  categories: yup.array().max(2),
});

export type ProjectMetadata = yup.Asserts<typeof projectMetadataSchema>;

export type FormProjectMetadata = Omit<ProjectMetadata, 'image'> & { image: File | undefined | string };

export type FormCreateProjectMetadata = FormProjectMetadata & NewDeployment;

export type ProjectWithMetadata = {
  id: string;
  owner: string;
  metadata?: ProjectMetadata;
};

export type ProjectDetails = {
  id: string;
  owner: string;
  metadata: ProjectMetadata;
  version: string;
  deploymentId: string;
  type: ProjectType;
};

export const newDeploymentSchema = yup.object({
  version: yup.string().defined(), // TODO lock to semver
  description: yup.string().optional(),
  deploymentId: yup.string().matches(CIDv0, `Doesn't match deployment id format`).defined(),
});

export type NewDeployment = yup.Asserts<typeof newDeploymentSchema>;

export const indexerMetadataSchema = yup.object({
  name: yup.string(),
  image: yup.string().optional(),
  url: yup.string() /*.required()*/,
});

export type IndexerDetails = yup.Asserts<typeof indexerMetadataSchema>;
