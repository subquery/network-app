// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Formik, Form, Field } from 'formik';
import { useTranslation } from 'react-i18next';
import { NewDeployment, newDeploymentSchema, ProjectMetadata, projectMetadataSchema } from '../../../models';
import { Button, ImageInput } from '../../../components';
import { useHistory } from 'react-router';
import styles from './Create.module.css';
import { useCreateProject, useRouteQuery } from '../../../hooks';
import { BigNumber } from '@ethersproject/bignumber';
import Instructions from './Instructions';

const Create: React.VFC = () => {
  const { t } = useTranslation('translation');

  const query = useRouteQuery();

  const history = useHistory();
  const createProject = useCreateProject();

  const handleSubmit = React.useCallback(
    async (project: ProjectMetadata & { image: File | undefined | string } & NewDeployment) => {
      // Form can give us a File type that doesn't match the schema
      const queryId = await createProject(project);

      const idHex = BigNumber.from(queryId).toHexString();

      console.log(`Query created. queryId=${idHex}`);
      history.push(`/studio/project/${idHex}`);
    },
    [history, createProject],
  );

  return (
    <div>
      <Formik
        initialValues={{
          name: query.get('name') ?? '',
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
            <div className={styles.upper}>
              <div className={['content-width', styles.header].join(' ')}>
                <div className={styles.details}>
                  <div className={styles.imageContainer}>
                    <ImageInput
                      label={t('studio.create.image')}
                      value={values.image}
                      onChange={(value) => setFieldValue('image', value)}
                      imageClassName={styles.image}
                    >
                      <div className={styles.imagePlaceholder}>
                        <img src="/static/default.project.png" alt="placeholder" className={styles.image} />
                        <div className={styles.imageOverlay}>
                          <i className="bi-camera" role="img" aria-label="camera" />
                          <p>Upload Logo</p>
                        </div>
                      </div>
                    </ImageInput>
                  </div>
                  <p className={styles.name}>{values.name}</p>
                </div>
                <div>
                  <Button onClick={submitForm} type="primary" label="Publish" disabled={isSubmitting} />
                </div>
              </div>
            </div>

            <div className={[styles.form, 'content-width'].join(' ')}>
              <div className={styles.fields}>
                <label htmlFor="name">{t('studio.create.name')}</label>
                <Field name="name" />
                {errors.name && touched.name && <div>{errors.name}</div>}

                <label htmlFor="description">{t('studio.create.description')}</label>
                <Field name="description" as="textarea" />
                <label htmlFor="websiteUrl">{t('studio.create.websiteUrl')}</label>
                <Field name="websiteUrl" />
                {errors.websiteUrl && touched.websiteUrl && <div>{errors.websiteUrl}</div>}
                <label htmlFor="codeUrl">{t('studio.create.codeUrl')}</label>
                <Field name="codeUrl" />
                {errors.codeUrl && touched.codeUrl && <div>{errors.codeUrl}</div>}
                <p className={styles.deployment}>Deployment Details</p>
                <label htmlFor="version">{t('deployment.create.version')}</label>
                <Field name="version" />
                <label htmlFor="deploymentId">{t('deployment.create.deploymentId')}</label>
                <Field name="deploymentId" />
                <label htmlFor="versionDescription">{t('deployment.create.description')}</label>
                <Field name="versionDescription" as="textarea" />
                {<p>{JSON.stringify(errors)}</p>}
              </div>
              <Instructions />
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default Create;
