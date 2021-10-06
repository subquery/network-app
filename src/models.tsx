import * as yup from 'yup';

export const projectMetadataSchema = yup.object({
  name: yup.string().defined(),
  image: yup.string().optional(),
  subtitle: yup.string().optional(),
  description: yup.string().default('').optional(),
  websiteUrl: yup.string().optional().url(),
});

export type ProjectMetadata = yup.Asserts<typeof projectMetadataSchema>;
