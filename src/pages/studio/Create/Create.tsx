// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Formik, Form, Field } from 'formik';
import { useIPFS, useProjectMetadata, useQueryRegistry } from '../../../containers';
import { useTranslation } from 'react-i18next';
import { NewDeployment, newDeploymentSchema, ProjectMetadata, projectMetadataSchema } from '../../../models';
import { Button, ImageInput } from '../../../components';
import { useHistory } from 'react-router';
import styles from './Create.module.css';
import { useCreateProject } from '../../../hooks/useCreateProject';

const Create: React.VFC = () => {
  const { t } = useTranslation('translation');

  const { uploadMetadata } = useProjectMetadata();
  const { ipfs } = useIPFS();
  const { registerQuery } = useQueryRegistry();
  const history = useHistory();
  const createProject = useCreateProject();

  const handleSubmit = React.useCallback(
    async (project: ProjectMetadata & { image: File | undefined | string } & NewDeployment) => {
      // Form can give us a File type that doesn't match the schema
      const queryId = await createProject(project);

      console.log(`Query created. queryId=${queryId.toString()}`);
      history.push(`/studio/project/${queryId.toString()}`);
    },
    [ipfs, uploadMetadata, registerQuery, history],
  );

  return (
    <div>
      <Formik
        initialValues={{
          name: '',
          description: '',
          websiteUrl: undefined,
          codeUrl: undefined,
          image: undefined,
          version: '1.0.0',
          versionDescription: '',
          deploymentId: '',
        }}
        validationSchema={projectMetadataSchema.shape({}).concat(newDeploymentSchema.shape({}))}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, setFieldValue, values, isSubmitting, submitForm }) => (
          <Form>
            <div className={styles.form}>
              <h4>Project Details</h4>
              <label htmlFor="name">{t('studio.create.name')}</label>
              <Field name="name" />
              {errors.name && touched.name && <div>{errors.name}</div>}
              <ImageInput
                label={t('studio.create.image')}
                value={values.image}
                onChange={(value) => setFieldValue('image', value)}
              />

              <label htmlFor="description">{t('studio.create.description')}</label>
              <Field name="description" as="textarea" />
              <label htmlFor="websiteUrl">{t('studio.create.websiteUrl')}</label>
              <Field name="websiteUrl" />
              {errors.websiteUrl && touched.websiteUrl && <div>{errors.websiteUrl}</div>}
              <label htmlFor="codeUrl">{t('studio.create.codeUrl')}</label>
              <Field name="codeUrl" />
              {errors.codeUrl && touched.codeUrl && <div>{errors.codeUrl}</div>}
              <h4>Deployment Details</h4>
              <label htmlFor="version">{t('deployment.create.version')}</label>
              <Field name="version" />
              <label htmlFor="versionDescription">{t('deployment.create.description')}</label>
              <Field name="versionDescription" />
              <label htmlFor="deploymentId">{t('deployment.create.deploymentId')}</label>
              <Field name="deploymentId" />
              {<p>{JSON.stringify(errors)}</p>}
              <div className={styles.submit}>
                <Button onClick={submitForm} type="primary" label="Save" disabled={isSubmitting} />
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default Create;
