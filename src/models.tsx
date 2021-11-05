// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ProjectManifestVersioned } from '@subql/common';
import { GraphQLSchema } from 'graphql';
import * as yup from 'yup';
import { CIDv0 } from './utils';

export const projectMetadataSchema = yup.object({
  name: yup.string().defined(),
  image: yup.string().optional(),
  subtitle: yup.string().optional(),
  description: yup.string().default('').optional(),
  websiteUrl: yup.string().optional().url(),
});

export type ProjectMetadata = yup.Asserts<typeof projectMetadataSchema>;

export type ProjectWithMetadata = {
  id: string;
  metadata: ProjectMetadata;
};

export type ProjectDetails = {
  id: string;
  metadata: ProjectMetadata;
  deployment: {
    id: string;
    manifest: ProjectManifestVersioned;
    schema: GraphQLSchema;
  };
};

export const newDeploymentSchema = yup.object({
  version: yup.string().defined(), // TODO lock to semver
  description: yup.string().optional(),
  deploymentId: yup.string().matches(CIDv0, `Doesn't match deployment id format`).defined(),
});

export type NewDeployment = yup.Asserts<typeof newDeploymentSchema>;
