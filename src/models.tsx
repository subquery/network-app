// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ProjectManifestVersioned } from '@subql/common';
import { GraphQLSchema } from 'graphql';
import * as yup from 'yup';

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
  deployment: string;
  metadata: ProjectMetadata;
  manifest: ProjectManifestVersioned;
  schema: GraphQLSchema;
};
