// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ProjectManifestVersioned } from '@subql/common/dist/project';
import * as yup from 'yup';
import { CIDv0 } from './utils';

export const projectMetadataSchema = yup.object({
  name: yup.string().defined(),
  image: yup.string().optional(),
  description: yup.string().default('').optional(),
  websiteUrl: yup.string().optional().url(),
  codeUrl: yup.string().optional().url(),
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
};

export type ProjectDeployment = {
  id: string;
  manifest: ProjectManifestVersioned;
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
