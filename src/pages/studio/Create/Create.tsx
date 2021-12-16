// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Formik, Form } from 'formik';
import { useTranslation } from 'react-i18next';
import { FormCreateProjectMetadata, newDeploymentSchema, projectMetadataSchema } from '../../../models';
import { FTextInput, ImageInput } from '../../../components';
import { Button, Typography } from '@subql/react-ui';
import { useHistory } from 'react-router';
import styles from './Create.module.css';
import { useCreateProject, useRouteQuery } from '../../../hooks';
import { BigNumber } from '@ethersproject/bignumber';
import Instructions from './Instructions';
import clsx from 'clsx';
import { isEthError } from '../../../utils';

const Create: React.VFC = () => {
  const { t } = useTranslation('translation');

  const query = useRouteQuery();

  const history = useHistory();
  const createProject = useCreateProject();

  const [submitError, setSubmitError] = React.useState<string>();

  const handleSubmit = React.useCallback(
    async (project: FormCreateProjectMetadata & { versionDescription: string }) => {
      try {
        // Form can give us a File type that doesn't match the schema
        const queryId = await createProject(project);

        const idHex = BigNumber.from(queryId).toHexString();

        console.log(`Query created. queryId=${idHex}`);
        history.push(`/studio/project/${idHex}`);
      } catch (e) {
        if (isEthError(e) && e.code === 4001) {
          setSubmitError(t('errors.transactionRejected'));
          return;
        }
        setSubmitError((e as Error).message);
      }
    },
    [history, createProject, t],
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
        {({ setFieldValue, values, isSubmitting, submitForm }) => (
          <Form>
            <div className={styles.upper}>
              <div className={clsx('content-width', styles.header)}>
                <div className={styles.details}>
                  <ImageInput
                    label={t('studio.create.image')}
                    value={values.image}
                    onChange={(value) => setFieldValue('image', value)}
                    placeholder="/static/default.project.png"
                  />
                  <p className={styles.name}>{values.name}</p>
                </div>
                <div>
                  <Button onClick={submitForm} type="primary" label="Publish" loading={isSubmitting} />
                </div>
              </div>
            </div>
            <div className={clsx(styles.form, 'content-width')}>
              <div className={styles.fields}>
                <FTextInput label={t('studio.create.name')} id="name" />
                <FTextInput label={t('studio.create.description')} id="description" base="textarea" />
                <FTextInput label={t('studio.create.websiteUrl')} id="websiteUrl" />
                <FTextInput label={t('studio.create.codeUrl')} id="codeUrl" />
                <p className={styles.deployment}>Deployment Details</p>
                <FTextInput label={t('deployment.create.version')} id="version" />
                <FTextInput label={t('deployment.create.deploymentId')} id="deploymentId" />
                <FTextInput label={t('deployment.create.description')} id="versionDescription" base="textarea" />
                {submitError && <Typography className={styles.error}>{submitError}</Typography>}
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
