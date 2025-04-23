// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useNavigate } from 'react-router';
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import FTextInput from '@components/FTextInput/FTextInput';
import ImageInput from '@components/ImageInput';
import { BigNumber } from '@ethersproject/bignumber';
import { useGetIfUnsafeDeployment } from '@hooks/useGetIfUnsafeDeployment';
import { useVerifyDeployment } from '@hooks/useVerifyDeployment';
import { ProjectActionArgv } from '@pages/explorer/Project/type';
import { Markdown, Modal, openNotification, Spinner, SubqlCheckbox, Tag, Typography } from '@subql/components';
import { Button, Radio, Result } from 'antd';
import clsx from 'clsx';
import { Field, FieldArray, Form, Formik } from 'formik';
import { t } from 'i18next';

import { useCreateProject, useProject, useRouteQuery, useUpdateProjectMetadata } from '../../../hooks';
import { FormCreateProjectMetadata, newDeploymentSchema, projectMetadataSchema, ProjectType } from '../../../models';
import { categoriesOptions, parseError, ROUTES } from '../../../utils';
import { ProjectDeploymentsDetail } from '../Project/Project';
import styles from './Create.module.less';

const { STUDIO_PROJECT_NAV } = ROUTES;

const Create: React.FC = () => {
  const query = useRouteQuery();
  const asyncProject = useProject(query.get('id') ?? '');

  const isEdit = React.useMemo(() => !!query.get('id'), [query]);
  const isSubgraph = React.useMemo(() => +(query.get('type') || 0) === ProjectType.SUBGRAPH, [query]);
  const navigate = useNavigate();
  const createProject = useCreateProject();
  const updateMetadata = useUpdateProjectMetadata(query.get('id') ?? '');
  const { getIfUnsafeAndWarn } = useGetIfUnsafeDeployment();
  const { verifyIfSubGraph, verifyIfSubQuery } = useVerifyDeployment();
  const handleSubmit = React.useCallback(
    async (project: FormCreateProjectMetadata & { versionDescription: string; type: ProjectType }) => {
      try {
        let resultId = query.get('id');
        if (isEdit) {
          const payload = {
            name: project.name,
            description: project.description,
            websiteUrl: project.websiteUrl,
            codeUrl: project.codeUrl,
            image: project.image,
            version: project.version,
            versionDescription: project.versionDescription,
            categories: project.categories,
          };
          await updateMetadata(payload);
        } else {
          const processNext = await getIfUnsafeAndWarn(project.deploymentId);
          if (processNext === 'cancel') return;
          if (project.type === ProjectType.SUBGRAPH) {
            const isSubGraph = await verifyIfSubGraph(project.deploymentId);
            if (!isSubGraph) {
              openNotification({
                type: 'error',
                description: 'The deployment is not a SubGraph, please check the deployment ID or the project type',
              });
              return;
            }
          }

          if (project.type === ProjectType.SUBQUERY) {
            const isSubQuery = await verifyIfSubQuery(project.deploymentId);
            if (!isSubQuery) {
              openNotification({
                type: 'error',
                description: 'The deployment is not a SubQuery, please check the deployment ID or the project type',
              });
              return;
            }
          }
          // Form can give us a File type that doesn't match the schema
          const queryId = await createProject(project);

          resultId = BigNumber.from(queryId).toHexString();
        }

        const { destroy } = Modal.success({
          className: styles.successModal,
          width: 801,
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
              title={
                <div className="col-flex" style={{ gap: 24 }}>
                  <div className="col-flex" style={{ gap: 8 }}>
                    <Typography variant="h6" weight={500}>
                      Successfully published project to Network
                    </Typography>
                    <Typography type="secondary">
                      Your
                      {
                        {
                          0: 'SubQuery',
                          1: 'RPC',
                          2: 'Dictionary',
                          3: 'Subgraph',
                        }[project.type]
                      }{' '}
                      project has been successfully published, you are able to view it in the SubQuery explorer, and
                      indexers will be able to index it.
                    </Typography>
                  </div>

                  <div className="col-flex" style={{ gap: 8 }}>
                    <Typography variant="h6" weight={500}>
                      Now what&apos;s next?
                    </Typography>
                    <Typography type="secondary">
                      Your next challenge is to get Node Operators to run your project, here are some options that you
                      have.
                    </Typography>
                  </div>

                  <div className={styles.plainCard}>
                    <div className="col-flex" style={{ gap: 8 }}>
                      <Typography>Boost your Project to attract Node Operators</Typography>
                      <Typography variant="medium" type="secondary">
                        You should boost your project by locking SQT to increase the rewards that Node Operators can
                        receive from your project. This is the best way to attract more Node Operators and ensure your
                        project is indexed.{' '}
                        <Typography.Link
                          active
                          href="https://academy.subquery.network/subquery_network/consumers/boosting.html#consumer-boosting"
                          target="_blank"
                        >
                          Read the docs.
                        </Typography.Link>
                      </Typography>
                    </div>
                    <Typography.Link
                      target="_href"
                      href={`/explorer/project/${resultId}?action=${ProjectActionArgv.BOOST}`}
                    >
                      <Button shape="round" type="primary" size="large">
                        Boost project
                      </Button>
                    </Typography.Link>
                  </div>

                  <div className={styles.plainCard}>
                    <div className="col-flex" style={{ gap: 8 }}>
                      <Typography>Setup Flex Plan</Typography>
                      <Typography variant="medium" type="secondary">
                        Flex plans are a great way to indicate to Node Operators what price you are willing to pay for
                        access to this project, you can create a flex plan today before any Node Operators complete
                        indexing.{' '}
                        <Typography.Link
                          active
                          href="https://academy.subquery.network/subquery_network/consumers/plan.html"
                          target="_blank"
                        >
                          Read the docs.
                        </Typography.Link>
                      </Typography>
                    </div>
                    <Typography.Link
                      target="_href"
                      href={`/explorer/project/${resultId}?action=${ProjectActionArgv.CREATE_PLAN}`}
                    >
                      <Button shape="round" type="primary" size="large">
                        Create flex plan
                      </Button>
                    </Typography.Link>
                  </div>

                  <div className={styles.plainCard}>
                    <div className="col-flex" style={{ gap: 8 }}>
                      <Typography>Create a closed price agreement</Typography>
                      <Typography variant="medium" type="secondary">
                        Creating a closed price agreement is good when only you will use the data in this project, as it
                        creates a commitment between you and a node operator to access data for a predetermined amount
                        of SQT.{' '}
                        <Typography.Link
                          active
                          href="https://academy.subquery.network/subquery_network/consumers/plan.html"
                          target="_blank"
                        >
                          Read the docs.
                        </Typography.Link>
                      </Typography>
                    </div>
                    <Typography.Link target="_href" href={`/consumer/my-offers`}>
                      <Button shape="round" type="primary" size="large">
                        Create agreement
                      </Button>
                    </Typography.Link>
                  </div>
                  <div className={styles.plainCard}>
                    <div className="col-flex" style={{ gap: 8 }}>
                      <Typography>Notify Node Operators on the Forum and in Discord</Typography>
                      <Typography variant="medium" type="secondary">
                        We recommend posting your project in the SubQuery Network forum and even mentioning it in the
                        Discord community.
                      </Typography>
                    </div>
                    <Typography.Link href="https://forum.subquery.network/" target="_blank">
                      <Button shape="round" type="primary" size="large">
                        Go to forum
                      </Button>
                    </Typography.Link>
                  </div>
                </div>
              }
              extra={[
                <Button
                  key="view-project"
                  type="primary"
                  shape="round"
                  size="large"
                  onClick={() => {
                    navigate(`${STUDIO_PROJECT_NAV}/${resultId}`);
                    destroy();
                  }}
                >
                  View project
                </Button>,
              ]}
            ></Result>
          ),
          okButtonProps: {
            style: { display: 'none' },
          },
        });
      } catch (e) {
        openNotification({
          type: 'error',
          description: parseError(e),
        });
      }
    },
    [getIfUnsafeAndWarn, navigate, createProject, verifyIfSubGraph, verifyIfSubQuery, isEdit],
  );

  if (isEdit && !asyncProject.data)
    return (
      <div style={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner></Spinner>
      </div>
    );
  return (
    <div>
      <Formik
        initialValues={{
          name: query.get('name') ?? '',
          // may be need check this, if need.
          type: +(query.get('type') ?? ProjectType.SUBQUERY),
          description: '',
          websiteUrl: '',
          codeUrl: '',
          image: undefined,
          version: '1.0.0',
          versionDescription: '',
          deploymentId: query.get('deploymentId') ?? '',
          categories: [],
          ...(isEdit
            ? {
                ...asyncProject.data?.metadata,
                type: asyncProject.data?.type,
              }
            : {}),
        }}
        validationSchema={
          isEdit
            ? projectMetadataSchema.shape({})
            : projectMetadataSchema.shape({}).concat(newDeploymentSchema.shape({}))
        }
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
                    <div>
                      {isSubgraph && (
                        <Tag style={{ background: '#6B46EF', color: '#fff', border: '1px solid #DFE3E880' }}>
                          Subgraph
                        </Tag>
                      )}
                      <FTextInput label={t('studio.create.name')} id="name" />
                    </div>
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
                      {isEdit ? 'Save Changes' : 'Publish'}
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
                  <Typography variant="medium" type="secondary">
                    Provide a detailed description of your project including what data it indexes and what it’s used
                    for. You might want to include how to get in contact you as the project author.
                  </Typography>
                  <Field name="description">
                    {({
                      field,
                      form,
                    }: {
                      field: { name: string; value: string };
                      form: { setFieldValue: (field: string, val: any) => void };
                    }) => {
                      return (
                        <div className={clsx(styles.markdownWrapper, errors.description ? styles.error : '')}>
                          <Markdown
                            value={field.value}
                            onChange={(e) => {
                              form.setFieldValue(field.name, e);
                            }}
                          />
                          {errors.description && (
                            <Typography type="danger" style={{ marginTop: 8 }}>
                              {errors.description}
                            </Typography>
                          )}
                        </div>
                      );
                    }}
                  </Field>
                  <Typography>
                    Categories
                    <Typography type="secondary" variant="medium" style={{ marginLeft: 8 }}>
                      Select up to 2
                    </Typography>
                  </Typography>

                  <FieldArray
                    name="categories"
                    render={(arrayHelper) => {
                      return (
                        <div className={styles.checkbox}>
                          <SubqlCheckbox.Group
                            options={[...categoriesOptions]}
                            value={arrayHelper.form.values.categories}
                            onChange={(e) => {
                              if (e.length > 2) return;
                              arrayHelper.form.setFieldValue('categories', e);
                            }}
                            optionType="button"
                          ></SubqlCheckbox.Group>
                        </div>
                      );
                    }}
                  ></FieldArray>
                  <div className={styles.fields} style={{ display: 'none' }}>
                    <Typography>Project Type</Typography>
                    <Field name="type">
                      {({
                        field,
                        form,
                      }: {
                        field: { name: string; value: string };
                        form: { setFieldValue: (field: string, val: any) => void };
                      }) => {
                        return (
                          <Radio.Group
                            value={field.value}
                            onChange={(val) => {
                              form.setFieldValue(field.name, val.target.value);
                            }}
                            disabled={isEdit}
                          >
                            <Radio value={ProjectType.SUBQUERY}>SubQuery</Radio>
                            <Radio value={ProjectType.SUBGRAPH}>SubGraph</Radio>
                          </Radio.Group>
                        );
                      }}
                    </Field>
                  </div>
                  <FTextInput label={`${t('studio.create.websiteUrl')}`} id="websiteUrl" required />
                  <FTextInput label={`${t('studio.create.codeUrl')}`} id="codeUrl" required />
                  {isEdit ? (
                    ''
                  ) : (
                    <>
                      <p className={styles.deployment}>Deployment Details</p>
                      <FTextInput label={t('deployment.create.version')} id="version" />
                      <FTextInput label={t('deployment.create.deploymentId')} id="deploymentId" />
                      <Typography>{t('studio.create.versionDesc')}</Typography>
                      <Typography variant="medium" type="secondary">
                        Provide a detailed description for Node Operators running your project, including how to run it,
                        breaking changes, any system requirements (e.g. database size), and even rough indexing time.
                        The more helpful information you provide, the higher chance that Node Operators will index it.
                      </Typography>
                      <Field name="versionDescription">
                        {({
                          field,
                          form,
                        }: {
                          field: { name: string; value: string };
                          form: { setFieldValue: (field: string, val: any) => void };
                        }) => {
                          return (
                            <div className={styles.markdownWrapper}>
                              <Markdown
                                value={field.value}
                                onChange={(e) => {
                                  form.setFieldValue(field.name, e);
                                }}
                              />
                            </div>
                          );
                        }}
                      </Field>
                    </>
                  )}
                </div>
              </div>
            </Form>
          );
        }}
      </Formik>

      {isEdit ? (
        <>
          <div style={{ padding: '0 80px' }}>
            <div
              style={{
                height: 1,
                width: '100%',
                background: 'var(--sq-gray300)',
                margin: '24px 0',
              }}
            ></div>
          </div>
          {asyncProject.data && (
            <ProjectDeploymentsDetail
              id={query.get('id') ?? ''}
              project={asyncProject.data}
              onRefresh={async () => {
                await asyncProject?.refetch?.();
              }}
            ></ProjectDeploymentsDetail>
          )}
        </>
      ) : (
        ''
      )}
    </div>
  );
};

export default Create;
