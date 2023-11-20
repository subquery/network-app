// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { BigNumber } from '@ethersproject/bignumber';
import { Button, Typography } from '@subql/components';
import clsx from 'clsx';
import { Form, Formik } from 'formik';

import { FTextInput, ImageInput } from '../../../components';
import { useCreateProject, useRouteQuery } from '../../../hooks';
import { FormCreateProjectMetadata, newDeploymentSchema, projectMetadataSchema } from '../../../models';
import { isEthError, parseError, ROUTES } from '../../../utils';
import styles from './Create.module.css';
import Instructions from './Instructions';
const { STUDIO_PROJECT_NAV } = ROUTES;

const Create: React.FC = () => {
  const { t } = useTranslation();

  const query = useRouteQuery();

  const navigate = useNavigate();
  const createProject = useCreateProject();

  const [submitError, setSubmitError] = React.useState<string>();

  const handleSubmit = React.useCallback(
    async (project: FormCreateProjectMetadata & { versionDescription: string }) => {
      try {
        // Form can give us a File type that doesn't match the schema
        const queryId = await createProject(project);

        const idHex = BigNumber.from(queryId).toHexString();

        console.log(`Query created. queryId=${idHex}`);
        navigate(`${STUDIO_PROJECT_NAV}/${idHex}`);
      } catch (e) {
        if (isEthError(e) && e.code === 4001) {
          setSubmitError(t('errors.transactionRejected'));
          return;
        }
        setSubmitError(parseError(e));
      }
    },
    [navigate, createProject, t],
  );

  return (
    <div>
      <Formik
        initialValues={{
          name: query.get('name') ?? '',
          type: 'SUBQUERY',
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
                <FTextInput label={t('studio.create.type')} placeholder="SUBQUERY" id="type" />
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
