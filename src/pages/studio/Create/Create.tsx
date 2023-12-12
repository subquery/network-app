// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { CloseOutlined } from '@ant-design/icons';
import { BigNumber } from '@ethersproject/bignumber';
import { Markdown, Typography } from '@subql/components';
import { Button, Modal, Result } from 'antd';
import clsx from 'clsx';
import { Field, Form, Formik } from 'formik';

import { FTextInput, ImageInput } from '../../../components';
import { useCreateProject, useRouteQuery } from '../../../hooks';
import { FormCreateProjectMetadata, newDeploymentSchema, projectMetadataSchema } from '../../../models';
import { isEthError, parseError } from '../../../utils';
import { ROUTES } from '../../../utils';
import styles from './Create.module.css';

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

        const { destroy } = Modal.info({
          width: 572,
          icon: (
            <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
              <CloseOutlined
                onClick={() => {
                  destroy();
                }}
                style={{ cursor: 'pointer' }}
              />
            </div>
          ),
          content: (
            <Result
              status="success"
              title="Successfully published project to Network"
              subTitle="Your project has been successfully published, you are able to view it in the Subquery explorer, and indexers will be able to index it."
              extra={[
                <Button
                  type="primary"
                  shape="round"
                  size="large"
                  onClick={() => {
                    navigate(`${STUDIO_PROJECT_NAV}/${idHex}`);
                  }}
                >
                  View project in Explorer
                </Button>,
              ]}
            ></Result>
          ),
          okButtonProps: {
            style: { display: 'none' },
          },
        });
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
          description: '',
          websiteUrl: undefined,
          codeUrl: undefined,
          image: undefined,
          version: '1.0.0',
          versionDescription: '',
          deploymentId: query.get('deploymentId') ?? '',
        }}
        validationSchema={projectMetadataSchema.shape({}).concat(newDeploymentSchema.shape({}))}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue, values, isSubmitting, submitForm, errors }) => {
          return (
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
                    <FTextInput label={t('studio.create.name')} id="name" />
                  </div>
                  <div>
                    <Button
                      onClick={() => {
                        submitForm();
                      }}
                      type="primary"
                      loading={isSubmitting}
                      shape="round"
                      size="large"
                    >
                      Publish
                    </Button>
                  </div>
                </div>
              </div>
              <div className={clsx(styles.form, 'content-width')}>
                <div className={styles.fields}>
                  <Typography variant="large" weight={600}>
                    Project Details
                  </Typography>
                  <Typography>{t('studio.create.description')}</Typography>

                  <Field name="description">
                    {({
                      field,
                      form,
                    }: {
                      field: { name: string; value: string };
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      form: { setFieldValue: (field: string, val: any) => void };
                    }) => {
                      return (
                        <Markdown
                          value={field.value}
                          onChange={(e) => {
                            form.setFieldValue(field.name, e);
                          }}
                        />
                      );
                    }}
                  </Field>
                  <FTextInput label={t('studio.create.websiteUrl')} id="websiteUrl" />
                  <FTextInput label={t('studio.create.codeUrl')} id="codeUrl" />
                  <p className={styles.deployment}>Deployment Details</p>
                  <FTextInput label={t('deployment.create.version')} id="version" />
                  <FTextInput label={t('deployment.create.deploymentId')} id="deploymentId" />
                  <Typography>{t('studio.create.versionDesc')}</Typography>
                  <Field name="versionDescription">
                    {({
                      field,
                      form,
                    }: {
                      field: { name: string; value: string };
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      form: { setFieldValue: (field: string, val: any) => void };
                    }) => {
                      return (
                        <Markdown
                          value={field.value}
                          onChange={(e) => {
                            form.setFieldValue(field.name, e);
                          }}
                        />
                      );
                    }}
                  </Field>
                  {submitError && <Typography className={styles.error}>{submitError}</Typography>}
                </div>
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default Create;
